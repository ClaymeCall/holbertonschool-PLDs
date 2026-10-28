// Smoke test bout-en-bout depuis le container API (pas de dépendance npm).
import assert from 'node:assert/strict';
const host=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const route=async(path,method='GET',body)=>{
 const res=await fetch(host+path,{method,headers:{'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 return {status:res.status,body:await res.json()};
};
let errors=0;
async function check(name,fn){try{await fn();console.log(`✅ ${name}`);}catch(e){errors++;console.error(`❌ ${name}: ${e.message}`);}}
await check('API /health',async()=>assert.equal((await route('/api/health')).status,200));
await check('Catalogue contient 12 jeux',async()=>assert.equal((await route('/api/games')).body.total,12));
await check('Service Stock opérationnel',async()=>assert.equal((await route('/api/stocks')).status,200));
await check('État de supervision accessible',async()=>assert.equal((await route('/api/ops/state')).status,200));
if(errors){console.error(`Smoke test : ${errors} échec(s)`);process.exitCode=1;}
else console.log('Smoke test : tout est opérationnel. Les bugs métier sont évalués par node --test.');
