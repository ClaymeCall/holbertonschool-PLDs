// Contrôle d'intégrité des fichiers protégés. Informatif/pédagogique : ne prétend pas être anti-triche.
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile(new URL('./protected-manifest.json',import.meta.url),'utf8'));
const root=new URL('../../',import.meta.url);
let changes=0;
for (const [path,expected] of Object.entries(manifest)) {
 try {
   const file=await readFile(new URL(path,root));
   const actual=createHash('sha256').update(file).digest('hex');
   if(actual!==expected){changes++;console.error(`❌ Modifié : ${path}`);}
 } catch {changes++;console.error(`❌ Introuvable : ${path}`);}
}
if(changes){console.error(`\n${changes} fichier(s) protégés altérés. Restaurer l'archive originale.`);process.exitCode=1;}
else console.log(`✅ Socle private/ intact (${Object.keys(manifest).length} fichiers contrôlés).`);
