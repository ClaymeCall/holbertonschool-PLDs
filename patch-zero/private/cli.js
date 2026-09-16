import { buildEvidence } from './evidence.js';
import { checkMission, checkAll } from './checks.js';

const [command, id] = process.argv.slice(2);

if (command === 'check') {
  if (!id) { console.error('Usage: npm run check -- PX-101'); process.exit(1); }
  const r = await checkMission(id);
  console.log(`${r.passed ? '[PASS]' : '[FAIL]'} ${r.id} - ${r.title}`);
  console.log(`Observed: ${r.evidence.observed}`);
  console.log(`Expected: ${r.evidence.expected}`);
  process.exitCode = r.passed ? 0 : 1;
} else if (command === 'evidence') {
  if (!id) { console.error('Usage: npm run evidence -- PX-101'); process.exit(1); }
  console.log(JSON.stringify(await buildEvidence(id), null, 2));
} else if (command === 'certify') {
  const all = await checkAll();
  const core = all.filter(x => x.tier === 'CORE');
  for (const x of core) console.log(`${x.passed ? '[PASS]' : '[FAIL]'} ${x.id} ${x.title}`);
  const pass = core.filter(x => x.passed).length;
  console.log(`\nCORE ${pass}/${core.length} ${pass === core.length ? 'LIVEOPS STABLE' : 'NOT READY'}`);
  process.exitCode = pass === core.length ? 0 : 1;
} else {
  console.log('Commands: check <PX-ID> | evidence <PX-ID> | certify');
}
