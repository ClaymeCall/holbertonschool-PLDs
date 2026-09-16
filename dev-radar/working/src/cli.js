import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OllamaClient } from './llm/ollama-client.js';
import { getBaseFeed } from './sources/source-engine.js';
import { runDeterministicPipeline } from './pipeline/orchestrator.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const working = path.resolve(here, '..');
const company = JSON.parse(fs.readFileSync(path.join(working, 'context/company-context.json'), 'utf8'));
const data = getBaseFeed();
const pipeline = runDeterministicPipeline(data, company);
console.log(pipeline.brief);

const localMode = process.argv.includes('--local') || Boolean(process.env.OLLAMA_MODEL);
if (localMode) {
  const client = new OllamaClient();
  console.log(`\n--- LOCAL MODEL CHECK (${client.model}) ---`);
  try {
    const answer = await client.generate('Reponds uniquement: DEV RADAR LOCAL OK');
    console.log(answer.trim());
  } catch (error) {
    console.error(`Modele local indisponible: ${error.message}`);
    process.exitCode = 2;
  }
} else {
  console.log('\nPipeline deterministe execute sans appel LLM. Pour inclure le modele local: npm run radar -- --local');
}
