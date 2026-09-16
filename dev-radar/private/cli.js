import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getState, replay, runCheck, validateAll, reset, CORE_IDS } from './engine.js';
const here=path.dirname(fileURLToPath(import.meta.url));
const hints=JSON.parse(fs.readFileSync(path.join(here,'hints.json'),'utf8'));
const [, , cmd, id, levelRaw] = process.argv;
if(cmd==='incident'){
  if(!id){console.error('Usage: npm run incident -- RAD-101');process.exit(2);} const r=replay(id); if(r.locked){console.error(`${id} LOCKED - ${r.message||'terminez la Foundation ou le CORE'}`);process.exit(1);} console.log(`\n${id} - INCIDENT ACTIVE\n${r.evidence.symptom}\nTopic: ${r.evidence.topic}\n`);
}else if(cmd==='check'){
  if(!id){console.error('Usage: npm run check -- RAD-101');process.exit(2);} const r=await runCheck(id); console.log(`${id}: ${r.ok?'CLEARED':'FAILED'} - ${r.message}`); if(!r.ok)process.exitCode=1;
}else if(cmd==='hint'){
  if(!id){console.error('Usage: npm run hint -- RAD-101 1');process.exit(2);} const level=Math.max(1,Math.min(3,Number(levelRaw||1))); const list=hints[id]||[]; console.log(`${id} - INDICE ${level}/3\n${list[level-1]||'Aucun indice supplémentaire pour cet incident.'}`);
}else if(cmd==='certify'){
  let ok=0; for(const coreId of CORE_IDS){const r=await runCheck(coreId);console.log(`${r.ok?'[OK]':'[ ]'} ${coreId} ${r.message}`);if(r.ok)ok++;} console.log(`\nCORE ${ok}/${CORE_IDS.length} ${ok===CORE_IDS.length?'DEV RADAR OPERATIONAL':'NOT READY'}`);if(ok!==CORE_IDS.length)process.exitCode=1;
}else if(cmd==='validate'){
  const r=await validateAll(); const ok=r.filter(x=>x.ok).length; for(const x of r)console.log(`${x.ok?'[OK]':'[ ]'} ${x.id} ${x.message}`); console.log(`\n${ok}/15 incidents behaviourally valid`); if(ok!==15)process.exitCode=1;
}else if(cmd==='reset'){
  reset(); console.log('DEV RADAR runtime reset.');
}else{
  const s=getState(); console.log(JSON.stringify(s,null,2));
}
