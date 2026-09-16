import { OllamaClient } from '../working/src/llm/ollama-client.js';

const client = new OllamaClient();
console.log(`Modele: ${client.model}`);
console.log(`Ollama: ${client.baseUrl}`);
try {
  await client.health();
  const answer = await client.generate('Reponds uniquement par: DEV RADAR LOCAL OK');
  if (!answer.trim()) throw new Error('EMPTY_RESPONSE');
  console.log('\nReponse locale:');
  console.log(answer.trim());
  console.log('\nLOCAL MODEL READY');
} catch (error) {
  console.error(`\nLOCAL MODEL NOT READY: ${error.message}`);
  console.error(`Verifiez Ollama puis: ollama pull ${client.model}`);
  process.exitCode = 2;
}
