import { scoutItems } from './scout.js';
import { dedupeEvents } from './dedupe.js';
import { assertNewsItems } from './contracts.js';
import { analyzeItem } from './analyst.js';
import { editAnalysis, renderBrief } from './editor.js';
import { externalEvidence } from './lineage.js';

export function runDeterministicPipeline(rawItems, companyContext, warnings = []) {
  const scouted = scoutItems(rawItems, companyContext);
  const deduped = dedupeEvents(scouted);
  assertNewsItems(deduped);
  const safe = externalEvidence(deduped);
  const analyzed = safe.map(item => analyzeItem(item, companyContext));
  const edited = analyzed.map(editAnalysis);
  return { scouted, deduped, analyzed, edited, brief: renderBrief(edited, warnings) };
}
