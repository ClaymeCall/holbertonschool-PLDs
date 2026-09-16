import fs from 'node:fs';
import { buildEvidence } from './evidence.js';

const missions = JSON.parse(fs.readFileSync(new URL('./missions.json', import.meta.url), 'utf8'));

export async function checkMission(id) {
  const mission = missions.find(m => m.id === id);
  if (!mission) throw new Error(`Unknown mission ${id}`);
  const evidence = await buildEvidence(id);
  return { id, title: mission.title, tier: mission.tier, passed: evidence.passed, evidence };
}

export async function checkAll() {
  const out = [];
  for (const mission of missions) out.push(await checkMission(mission.id));
  return out;
}

export function getMissions() { return missions; }
