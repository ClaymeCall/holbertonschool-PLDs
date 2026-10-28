// Tests HTTP bout-en-bout après correction. Requiert api et inventory démarrés.
// Réinitialise le stock et le chaos à la fin, même en cas d'erreur.
import assert from 'node:assert/strict';
const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
async function call(path,body){
 const start=performance.now();
 const r=await fetch(base+path,body===undefined?{}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
 return {status:r.status,body:await r.json(),ms:performance.now()-start};
}
let failures=0;
async function step(name,fn){try{await fn();console.log(`✅ ${name}`);}catch(e){failures++;console.error(`❌ ${name}: ${e.message}`);}}
try{
 await step('Stock de départ réinitialisé',async()=>assert.equal((await call('/api/ops/reset',{})).status,200));
 await step('Recherche mario : 1 seul jeu',async()=>{const r=await call('/api/games?q=mario');assert.equal(r.status,200);assert.deepEqual(r.body.items.map(g=>g.id),['pixel-drift']);});
 await step('Jeu inexistant : 404',async()=>assert.equal((await call('/api/games/unknown')).status,404));
 await step('Quantité illégale : 400',async()=>assert.equal((await call('/api/checkout',{items:[{id:'pixel-drift',quantity:0}]})).status,400));
 await step('Prix falsifié ignoré : 201 et 29,90 €',async()=>{const r=await call('/api/checkout',{items:[{id:'pixel-drift',quantity:1,unitPriceCents:1}]});assert.equal(r.status,201);assert.equal(r.body.totalCents,2990);});
 await step('Rupture de stock : 409',async()=>{const r=await call('/api/checkout',{items:[{id:'galaxy-strike',quantity:1}]});assert.equal(r.status,409);});
 await step('Panne distante : 503',async()=>{await call('/api/ops/mode',{mode:'down'});const r=await call('/api/checkout',{items:[{id:'pixel-drift',quantity:1}]});assert.equal(r.status,503);});
 await step('Service lent : timeout 503 rapide',async()=>{
  await call('/api/ops/mode',{mode:'slow'});
  const r=await call('/api/checkout',{items:[{id:'pixel-drift',quantity:1}]});
  assert.equal(r.status,503);assert.ok(r.ms<1200,`timeout trop lent : ${Math.round(r.ms)} ms`);
  await new Promise(resolve=>setTimeout(resolve,1800));
  const s=await call('/api/stocks');assert.equal(s.body.stock['pixel-drift'],6,'une commande annulée ne doit pas débiter le stock en mode lent');
 });
 await step('48 recherches sous charge : HTTP 200',async()=>{const r=await call('/api/ops/load',{count:48});assert.equal(r.status,200);assert.equal(r.body.successes,48);});
}finally{
 try{await call('/api/ops/reset',{});}catch{}
}
if(failures){console.error(`E2E : ${failures} étape(s) en échec`);process.exitCode=1;}
else console.log('✅ E2E : scénario complet vérifié.');
