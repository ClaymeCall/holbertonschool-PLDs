import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('M6 — dossier de conception : schéma de l\'architecture réelle et décisions',async()=>{
 const doc=await readFile(new URL('../../work/docs/architecture.md',import.meta.url),'utf8');
 assert.match(doc,/```mermaid\s*\nflowchart\s+(?:LR|RL|TB|TD|BT)[\s\S]+?```/);
 for(const word of ['Nginx','API','Stock','Catalogue','Commandes','Controller','Service','Repository','MVC','MVVM','MVT','p95','cache','microservice','monolithe']){
  assert.match(doc,new RegExp(word,'i'),`Le document doit traiter « ${word} »`);
 }
 assert.doesNotMatch(doc,/À compléter|TODO|TBD|\[votre réponse\]/i);
});
