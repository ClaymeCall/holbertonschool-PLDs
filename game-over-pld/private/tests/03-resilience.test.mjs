import test from 'node:test';import assert from 'node:assert/strict';
import {reserveStock} from '../../work/api/inventory.client.mjs';
const items=[{id:'a',quantity:1}];
test('M3 — succès distant : POST et corps respectés',async()=>{
 let call;
 const fake=async(url,opts)=>{call={url,opts};return {ok:true,status:200,json:async()=>({ok:true,stock:{a:4}})};};
 const r=await reserveStock(items,{baseUrl:'http://inventory.test',fetchImpl:fake});
 assert.equal(r.ok,true);assert.equal(r.stock.a,4);assert.equal(call.url,'http://inventory.test/reserve');
 assert.equal(call.opts.method,'POST');assert.deepEqual(JSON.parse(call.opts.body).items,items);
});
test('M3 — stock épuisé : conserver code 409 et OUT_OF_STOCK',async()=>{
 const fake=async()=>({ok:false,status:409,json:async()=>({error:'OUT_OF_STOCK',gameId:'a',available:0})});
 const r=await reserveStock(items,{fetchImpl:fake});assert.equal(r.ok,false);assert.equal(r.status,409);assert.equal(r.error,'OUT_OF_STOCK');
});
test('M3 — timeout réel via AbortSignal : réponse 503 en temps limité',async()=>{
 let abortObserved=false;
 const hungFetch=(_url,opts)=>new Promise((_resolve,reject)=>{
   opts.signal?.addEventListener('abort',()=>{abortObserved=true;reject(opts.signal.reason);},{once:true});
 });
 const timeoutResult=Symbol('not timed out');
 const result=await Promise.race([
   reserveStock(items,{fetchImpl:hungFetch,timeoutMs:25}),
   new Promise(resolve=>setTimeout(()=>resolve(timeoutResult),250))
 ]);
 assert.notEqual(result,timeoutResult,'La requête doit abandonner avant 250 ms');
 assert.equal(abortObserved,true,'Le signal abort doit être transmis à fetch');
 assert.equal(result.ok,false);assert.equal(result.status,503);assert.equal(result.error,'INVENTORY_UNAVAILABLE');
});
test('M3 — panne réseau : HTTP 503 au lieu de valider une commande',async()=>{
 const r=await reserveStock(items,{fetchImpl:async()=>{throw Error('ECONNREFUSED');}});
 assert.equal(r.ok,false);assert.equal(r.status,503);
});
