import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runDeterministicPipeline } from '../src/pipeline/orchestrator.js';
import { getBaseFeed } from '../src/sources/source-engine.js';
import { normalizeRawItem } from '../src/pipeline/scout.js';
import { approxTokens } from '../src/utils/tokens.js';
import { OllamaClient, DEFAULT_LOCAL_MODEL } from '../src/llm/ollama-client.js';

const company = JSON.parse(fs.readFileSync(new URL('../context/company-context.json', import.meta.url), 'utf8'));

test('starter charge le feed DEV RADAR', () => {
  assert.ok(getBaseFeed().length >= 3);
});

test('un signal est normalise avec une provenance', () => {
  const item = normalizeRawItem(getBaseFeed()[0]);
  assert.equal(item.origin, 'external');
  assert.ok(item.sourceUrl);
});

test('le pipeline de base produit un brief', () => {
  const result = runDeterministicPipeline(getBaseFeed(), company);
  assert.match(result.brief, /DEV RADAR/);
});

test('le budget de contexte utilise une estimation locale sans API payante', () => {
  assert.ok(approxTokens('abcd'.repeat(100)) > 0);
});


test('le modele local de reference est configure sans cle API', () => {
  const client = new OllamaClient();
  assert.equal(DEFAULT_LOCAL_MODEL, 'qwen2.5-coder:3b');
  assert.equal(client.model, DEFAULT_LOCAL_MODEL);
  assert.equal(client.baseUrl, 'http://127.0.0.1:11434');
});
