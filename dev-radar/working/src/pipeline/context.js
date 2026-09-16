import { approxTokens } from '../utils/tokens.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const working = path.resolve(here, '../..');

export function compressSourceText(text, maxChars = 1200) {
  return String(text).slice(0, maxChars);
}

export function buildContextForAgent(role) {
  const files = [
    'context/company-context.json',
    'memory/MEMORY.md',
    'skills/SOURCE_VALIDATION.md',
    'skills/TECH_RELEVANCE.md',
    'skills/BRIEF_FORMAT.md',
    'skills/AGENT_CONTRACTS.md',
    'agents/scout.md',
    'agents/analyst.md',
    'agents/editor.md'
  ];
  const parts = files.map(rel => ({ rel, text: fs.readFileSync(path.join(working, rel), 'utf8') }));
  return {
    role,
    parts,
    tokens: parts.reduce((n, p) => n + approxTokens(p.text), 0)
  };
}
