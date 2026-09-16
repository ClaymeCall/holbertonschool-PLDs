/**
 * PATCH//ZERO - OPTIONAL REMOTE AI PROVIDER
 *
 * WHERE THIS RUNS
 * ÉQUIPE IA -> /api/agent/test -> askAgent()
 *
 * IMPORTANT FOR THE PLD
 * The missions, Replay, Check and certify NEVER depend on a cloud model.
 * Fixture Safe Mode is the default and remains available even when a remote
 * provider is misconfigured, rate-limited or temporarily unavailable.
 *
 * Live providers use the common OpenAI-compatible Chat Completions contract.
 * Supported directly: OpenAI, Google Gemini, xAI/Grok, Mistral, Groq,
 * OpenRouter, plus a custom OpenAI-compatible endpoint.
 *
 * This file is workshop infrastructure; it is NOT one of the incidents.
 */
import fs from 'node:fs';
import path from 'node:path';

const REQUEST_TIMEOUT_MS = 12_000;
const FIXTURE_MODEL = 'fixture/liveops-v1';

const PROVIDERS = Object.freeze({
  fixture: {
    label: 'Fixture Safe Mode',
  },
  openai: {
    label: 'OpenAI',
    keyEnv: 'OPENAI_API_KEY',
    baseURL: 'https://api.openai.com/v1',
  },
  gemini: {
    label: 'Google Gemini',
    keyEnv: 'GEMINI_API_KEY',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  },
  xai: {
    label: 'xAI / Grok',
    keyEnv: 'XAI_API_KEY',
    baseURL: 'https://api.x.ai/v1',
  },
  mistral: {
    label: 'Mistral AI',
    keyEnv: 'MISTRAL_API_KEY',
    baseURL: 'https://api.mistral.ai/v1',
  },
  groq: {
    label: 'Groq',
    keyEnv: 'GROQ_API_KEY',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  openrouter: {
    label: 'OpenRouter',
    keyEnv: 'OPENROUTER_API_KEY',
    baseURL: 'https://openrouter.ai/api/v1',
  },
  custom: {
    label: 'OpenAI-compatible custom',
    keyEnv: 'AI_API_KEY',
    customBaseURL: true,
    keyOptional: true,
  },
});

const ALIASES = Object.freeze({
  grok: 'xai',
  google: 'gemini',
  'openai-compatible': 'custom',
});

function readEnv() {
  const envPath = path.resolve('.env');
  const parsed = {};
  if (fs.existsSync(envPath)) {
    for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const idx = line.indexOf('=');
      parsed[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  }
  // Shell / CI variables always win over .env.
  return { ...parsed, ...process.env };
}

function boolFromEnv(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return !['0', 'false', 'no', 'off'].includes(String(value).trim().toLowerCase());
}

function normalizeProvider(value) {
  const configured = String(value || 'fixture').trim().toLowerCase();
  const aliased = ALIASES[configured] || configured;
  return {
    configured,
    normalized: PROVIDERS[aliased] ? aliased : 'fixture',
    supported: Boolean(PROVIDERS[aliased]),
  };
}

function chatCompletionsURL(baseURL) {
  const clean = String(baseURL || '').trim().replace(/\/+$/, '');
  if (!clean) return null;
  if (/\/chat\/completions$/i.test(clean)) return clean;
  return `${clean}/chat/completions`;
}

function normalizeUsage(usage = {}) {
  const inputTokens = Number(usage.prompt_tokens ?? usage.input_tokens ?? 0) || 0;
  const outputTokens = Number(usage.completion_tokens ?? usage.output_tokens ?? 0) || 0;
  const totalTokens = Number(usage.total_tokens ?? (inputTokens + outputTokens)) || 0;
  return { inputTokens, outputTokens, totalTokens };
}

function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.map(part => {
    if (typeof part === 'string') return part;
    return part?.text ?? part?.content ?? '';
  }).filter(Boolean).join('\n');
}

function fixtureAnswer(agentId, extra = {}) {
  const FIXTURES = {
    support: 'Ticket classé : accès au compte. Recommandation : vérification humaine, aucune sanction automatique.',
    anticheat: 'Preuves insuffisantes. Confiance 0,58. Escalade vers REVIEWER au lieu d’un bannissement automatique.',
    economy: 'Pic marketplace détecté sur EU-03. Recommandation : surveiller, aucune mutation directe du marché.',
    release: 'Le manifeste officiel ne confirme pas cette mécanique. Le résumé généré ne fait pas autorité.',
  };
  return {
    provider: 'fixture',
    model: FIXTURE_MODEL,
    output: FIXTURES[agentId] || 'Aucune fixture disponible pour ce rôle.',
    usage: { inputTokens: 184, outputTokens: 42, totalTokens: 226 },
    latencyMs: 120 + String(agentId || '').length * 17,
    ...extra,
  };
}

export function providerStatus() {
  const env = readEnv();
  const choice = normalizeProvider(env.AI_PROVIDER);
  const provider = choice.normalized;
  const def = PROVIDERS[provider];
  const fallbackToFixture = boolFromEnv(env.AI_FALLBACK_TO_FIXTURE, true);

  if (!choice.supported) {
    return {
      provider: 'fixture',
      label: PROVIDERS.fixture.label,
      model: FIXTURE_MODEL,
      configuredProvider: choice.configured,
      keyPresent: true,
      live: false,
      mode: 'fixture',
      fallbackToFixture,
      warning: `Provider non supporté: ${choice.configured}. Fixture Safe Mode activé.`,
    };
  }

  if (provider === 'fixture') {
    return {
      provider,
      label: def.label,
      model: FIXTURE_MODEL,
      configuredProvider: choice.configured,
      keyPresent: true,
      live: false,
      mode: 'fixture',
      fallbackToFixture,
      warning: null,
    };
  }

  const model = String(env.AI_MODEL || '').trim();
  const baseURL = def.customBaseURL
    ? String(env.AI_BASE_URL || '').trim().replace(/\/+$/, '')
    : String(env.AI_BASE_URL || def.baseURL).trim().replace(/\/+$/, '');
  const key = String(env[def.keyEnv] || env.AI_API_KEY || '').trim();
  const keyPresent = def.keyOptional ? true : Boolean(key);
  const missing = [];
  if (!model) missing.push('AI_MODEL');
  if (!baseURL) missing.push('AI_BASE_URL');
  if (!keyPresent) missing.push(def.keyEnv);
  const live = missing.length === 0;

  return {
    provider,
    label: def.label,
    model: model || FIXTURE_MODEL,
    configuredProvider: choice.configured,
    keyPresent,
    live,
    mode: live ? 'live' : 'fixture',
    fallbackToFixture,
    baseURL: live ? baseURL : null,
    warning: missing.length ? `Configuration ${def.label} incomplète: ${missing.join(', ')}. Fixture Safe Mode activé.` : null,
  };
}

export async function askAgent({ agentId, system, input }) {
  const env = readEnv();
  const status = providerStatus();
  const started = Date.now();

  if (!status.live) {
    return fixtureAnswer(agentId, status.provider === 'fixture' ? {} : {
      requestedProvider: status.provider,
      requestedModel: status.model,
      fallback: true,
      warning: status.warning,
    });
  }

  const def = PROVIDERS[status.provider];
  const key = String(env[def.keyEnv] || env.AI_API_KEY || '').trim();
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: input },
  ];
  const headers = { 'content-type': 'application/json' };
  if (key) headers.authorization = `Bearer ${key}`;
  if (status.provider === 'openrouter') {
    headers['x-title'] = 'PATCH//ZERO PLD';
    headers['http-referer'] = `http://localhost:${env.PORT || 4177}`;
  }

  try {
    const response = await fetch(chatCompletionsURL(status.baseURL), {
      method: 'POST',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers,
      // Keep the payload deliberately small and vendor-neutral. Provider/model
      // specific tuning is not the pedagogical goal of this workshop.
      body: JSON.stringify({ model: status.model, messages }),
    });

    if (!response.ok) {
      const raw = (await response.text()).slice(0, 700);
      throw new Error(`${status.label} ${response.status}: ${raw || response.statusText}`);
    }

    const data = await response.json();
    const output = extractText(data.choices?.[0]?.message?.content);
    if (!output) throw new Error(`${status.label}: réponse reçue sans contenu texte exploitable.`);

    return {
      provider: status.provider,
      model: data.model || status.model,
      output,
      usage: normalizeUsage(data.usage),
      latencyMs: Date.now() - started,
      fallback: false,
    };
  } catch (error) {
    if (!status.fallbackToFixture) throw error;
    return fixtureAnswer(agentId, {
      latencyMs: Date.now() - started,
      requestedProvider: status.provider,
      requestedModel: status.model,
      fallback: true,
      warning: `Provider live indisponible -> Fixture Safe Mode: ${error.message}`,
    });
  }
}

// Exported for smoke tests and for future workshop extensions.
export const SUPPORTED_AI_PROVIDERS = Object.freeze(Object.keys(PROVIDERS));
