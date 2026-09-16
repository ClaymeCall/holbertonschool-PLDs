import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { providerStatus, askAgent, SUPPORTED_AI_PROVIDERS } from '../ai/provider.js';
import { getMissions } from '../../private/checks.js';
import { buildEvidence } from '../../private/evidence.js';

test('starter exposes 6 CORE missions', () => {
  assert.equal(getMissions().filter(x => x.tier === 'CORE').length, 6);
});

test('starter exposes 6 BONUS missions', () => {
  assert.equal(getMissions().filter(x => x.tier === 'BONUS').length, 6);
});

test('every mission points to an existing student file', () => {
  for (const mission of getMissions()) {
    assert.ok(fs.existsSync(new URL(`../../${mission.startFile}`, import.meta.url)), `${mission.id}: ${mission.startFile}`);
  }
});

test('every starter replay executes without crashing', async () => {
  // Missions are intentionally red in the starter. This test checks the replay
  // engine contract only: each mission must produce evidence instead of throwing.
  for (const mission of getMissions()) {
    const evidence = await buildEvidence(mission.id);
    assert.equal(evidence.id, mission.id);
    assert.equal(typeof evidence.passed, 'boolean');
    assert.equal(typeof evidence.expected, 'string');
  }
});

test('AI provider defaults safely to fixture mode', () => {
  const old = process.env.AI_PROVIDER;
  delete process.env.AI_PROVIDER;
  const s = providerStatus();
  assert.equal(s.provider, 'fixture');
  assert.equal(s.live, false);
  if (old === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = old;
});

test('unsupported AI provider falls back safely instead of pretending to be live', () => {
  const old = process.env.AI_PROVIDER;
  process.env.AI_PROVIDER = 'unknown-provider';
  const s = providerStatus();
  assert.equal(s.provider, 'fixture');
  assert.equal(s.live, false);
  assert.match(s.warning || '', /non supporté/i);
  if (old === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = old;
});

test('student guide maps exist', () => {
  assert.equal(fs.existsSync(new URL('../PROJECT_MAP.md', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../runbooks/PROJECT_MAP.md', import.meta.url)), true);
});

test('browser runtime is vendored locally', () => {
  for (const rel of ['../../public/vendor/react.production.min.js','../../public/vendor/react-dom.production.min.js','../../public/vendor/three.min.js','../../public/vendor/earth/earth.jpg']) {
    assert.equal(fs.existsSync(new URL(rel, import.meta.url)), true, rel);
  }
});


test('multi-provider catalogue exposes the expected live choices', () => {
  for (const provider of ['fixture','openai','gemini','xai','mistral','groq','openrouter','custom']) {
    assert.ok(SUPPORTED_AI_PROVIDERS.includes(provider), provider);
  }
});

test('grok alias resolves to xAI and stays safe without a key', () => {
  const oldProvider = process.env.AI_PROVIDER;
  const oldModel = process.env.AI_MODEL;
  const oldKey = process.env.XAI_API_KEY;
  process.env.AI_PROVIDER = 'grok';
  process.env.AI_MODEL = 'grok-test';
  delete process.env.XAI_API_KEY;
  const s = providerStatus();
  assert.equal(s.provider, 'xai');
  assert.equal(s.live, false);
  assert.match(s.warning || '', /XAI_API_KEY/);
  if (oldProvider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = oldProvider;
  if (oldModel === undefined) delete process.env.AI_MODEL; else process.env.AI_MODEL = oldModel;
  if (oldKey === undefined) delete process.env.XAI_API_KEY; else process.env.XAI_API_KEY = oldKey;
});

test('custom OpenAI-compatible provider sends a real Chat Completions request', async () => {
  const captured = {};
  const mock = http.createServer(async (req, res) => {
    captured.url = req.url;
    captured.authorization = req.headers.authorization || null;
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    captured.body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({
      model: 'mock-live-model',
      choices: [{message:{content:'Réponse LIVE de test.'}}],
      usage: {prompt_tokens: 12, completion_tokens: 5, total_tokens: 17},
    }));
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  const port = mock.address().port;

  const keys = ['AI_PROVIDER','AI_BASE_URL','AI_API_KEY','AI_MODEL','AI_FALLBACK_TO_FIXTURE'];
  const old = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  process.env.AI_PROVIDER = 'custom';
  process.env.AI_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.AI_API_KEY = 'local-test-key';
  process.env.AI_MODEL = 'mock-model';
  process.env.AI_FALLBACK_TO_FIXTURE = 'true';

  try {
    const status = providerStatus();
    assert.equal(status.live, true);
    const out = await askAgent({agentId:'support', system:'Test system', input:'Hello'});
    assert.equal(out.provider, 'custom');
    assert.equal(out.model, 'mock-live-model');
    assert.equal(out.output, 'Réponse LIVE de test.');
    assert.deepEqual(out.usage, {inputTokens:12, outputTokens:5, totalTokens:17});
    assert.equal(captured.url, '/v1/chat/completions');
    assert.equal(captured.authorization, 'Bearer local-test-key');
    assert.equal(captured.body.model, 'mock-model');
    assert.equal(captured.body.messages.length, 2);
  } finally {
    await new Promise(resolve => mock.close(resolve));
    for (const k of keys) {
      if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k];
    }
  }
});

test('live provider failure falls back to fixture without breaking Agent Lab', async () => {
  const mock = http.createServer((req, res) => {
    res.writeHead(429, {'content-type':'application/json'});
    res.end(JSON.stringify({error:'quota test'}));
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  const port = mock.address().port;

  const keys = ['AI_PROVIDER','AI_BASE_URL','AI_API_KEY','AI_MODEL','AI_FALLBACK_TO_FIXTURE'];
  const old = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  process.env.AI_PROVIDER = 'custom';
  process.env.AI_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.AI_API_KEY = '';
  process.env.AI_MODEL = 'mock-model';
  process.env.AI_FALLBACK_TO_FIXTURE = 'true';

  try {
    const out = await askAgent({agentId:'support', system:'Test system', input:'Hello'});
    assert.equal(out.provider, 'fixture');
    assert.equal(out.fallback, true);
    assert.equal(out.requestedProvider, 'custom');
    assert.match(out.warning || '', /429|fallback|indisponible/i);
  } finally {
    await new Promise(resolve => mock.close(resolve));
    for (const k of keys) {
      if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k];
    }
  }
});

test('named providers become LIVE only with model + matching key', () => {
  const cases = [
    ['openai','OPENAI_API_KEY','https://api.openai.com/v1'],
    ['gemini','GEMINI_API_KEY','https://generativelanguage.googleapis.com/v1beta/openai'],
    ['xai','XAI_API_KEY','https://api.x.ai/v1'],
    ['mistral','MISTRAL_API_KEY','https://api.mistral.ai/v1'],
    ['groq','GROQ_API_KEY','https://api.groq.com/openai/v1'],
    ['openrouter','OPENROUTER_API_KEY','https://openrouter.ai/api/v1'],
  ];
  const envKeys = ['AI_PROVIDER','AI_MODEL','AI_BASE_URL','AI_API_KEY', ...cases.map(x => x[1])];
  const old = Object.fromEntries(envKeys.map(k => [k, process.env[k]]));
  try {
    for (const key of envKeys) delete process.env[key];
    for (const [provider,keyEnv,baseURL] of cases) {
      for (const [,k] of cases) delete process.env[k];
      process.env.AI_PROVIDER = provider;
      process.env.AI_MODEL = 'student-chosen-model';
      process.env[keyEnv] = 'test-key';
      const s = providerStatus();
      assert.equal(s.provider, provider);
      assert.equal(s.live, true, provider);
      assert.equal(s.baseURL, baseURL, provider);
      assert.equal(s.model, 'student-chosen-model');
    }
  } finally {
    for (const k of envKeys) {
      if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k];
    }
  }
});
