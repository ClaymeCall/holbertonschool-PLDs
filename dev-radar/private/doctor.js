import { execFileSync } from 'node:child_process';

const RECOMMENDED_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:3b';
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const major = Number(process.versions.node.split('.')[0]);
let failed = false;

function ok(label, detail='') { console.log(`OK  ${label}${detail ? ` - ${detail}` : ''}`); }
function warn(label, detail='') { console.log(`WARN ${label}${detail ? ` - ${detail}` : ''}`); }
function ko(label, detail='') { console.log(`KO  ${label}${detail ? ` - ${detail}` : ''}`); failed = true; }

if (major >= 20) ok('Node.js', process.versions.node);
else ko('Node.js', `${process.versions.node} - Node 20+ requis`);

let tags = null;
try {
  const response = await fetch(`${OLLAMA_URL}/api/tags`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  tags = await response.json();
  ok('Ollama local', OLLAMA_URL);
} catch (error) {
  ko('Ollama local', `indisponible sur ${OLLAMA_URL}`);
  console.log('    Lancez Ollama, puis reessayez. Au besoin: ollama serve');
}

if (tags) {
  const names = (tags.models || []).map(model => model.name || model.model).filter(Boolean);
  const installed = names.some(name => name === RECOMMENDED_MODEL || name.startsWith(`${RECOMMENDED_MODEL}:`));
  if (installed) ok('Modele local', RECOMMENDED_MODEL);
  else {
    ko('Modele local', `${RECOMMENDED_MODEL} absent`);
    console.log(`    Installez-le avec: ollama pull ${RECOMMENDED_MODEL}`);
  }
}

try {
  const version = execFileSync('code', ['--version'], { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim().split(/\r?\n/)[0];
  const parts = version.split('.').map(Number);
  const recentEnough = parts[0] > 1 || (parts[0] === 1 && parts[1] >= 127);
  if (recentEnough) ok('VS Code', version);
  else warn('VS Code', `${version} - l extension Ollama officielle demande VS Code 1.127+`);

  const extensions = execFileSync('code', ['--list-extensions'], { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] })
    .split(/\r?\n/).map(x => x.trim().toLowerCase());
  if (extensions.includes('ollama.ollama')) ok('Extension VS Code', 'Ollama.ollama');
  else warn('Extension VS Code', 'Ollama officielle non detectee par le CLI');
} catch {
  warn('VS Code CLI', 'commande `code` non detectee; verifiez manuellement VS Code et l extension Ollama');
}

console.log(`\nModele de reference DEV RADAR: ${RECOMMENDED_MODEL}`);
console.log('Inference du PLD: locale. Les checkers restent deterministes et n appellent aucune API IA cloud.');
if (failed) process.exitCode = 1;
