import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(here, '../../data/base-feed.json');

export function getBaseFeed() {
  return JSON.parse(fs.readFileSync(basePath, 'utf8'));
}

export function sourceHealth() {
  return { github: 'ok', releases: 'ok', security: 'ok', mode: 'local-fixture' };
}
