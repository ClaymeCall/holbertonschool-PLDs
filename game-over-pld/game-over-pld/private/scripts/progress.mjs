// Progression lisible pour les étudiants : exécute les tests de chaque mission.
import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
const testFiles=readdirSync('private/tests').filter(file=>file.endsWith('.test.mjs')).map(file=>`private/tests/${file}`);
const missions=[
 ['M1','Couches et catalogue'],['M2','Domaine Commandes'],
 ['M3','Service Stock distant'],['M4','ViewModel'],
 ['M5','Cache et charge'],['M6','Décisions d’architecture']
];
console.log('\nGAME OVER — ÉTAT DES SIX MISSIONS\n');
let done=0;
for(const [id,label] of missions){
 const r=spawnSync(process.execPath,['--test',`--test-name-pattern=${id}`,...testFiles],{cwd:process.cwd(),encoding:'utf8',timeout:30000});
 const ok=r.status===0;
 if(ok)done++;
 const msg=ok?'VALIDÉE':'À TERMINER';
 console.log(`${id.padEnd(3)} | ${label.padEnd(28)} | ${msg}`);
 if(r.error)console.error(`  Échec du lanceur : ${r.error.message}`);
}
console.log(`\nProgression : ${done}/6 missions validées.\n`);
console.log('Pour voir le détail des erreurs : node --test');
