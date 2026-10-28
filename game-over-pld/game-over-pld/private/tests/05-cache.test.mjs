import test from 'node:test';import assert from 'node:assert/strict';
import {createCache} from '../../work/api/cache.mjs';
test('M5 — 2 appels même clé dans le TTL = 1 calcul',async()=>{
 let count=0;const cache=createCache();const compute=async()=>{count++;return ['ok'];};
 const a=await cache.getOrCompute('catalog:all',compute,10000);
 const b=await cache.getOrCompute('catalog:all',compute,10000);
 assert.deepEqual(a,b);assert.equal(count,1);
});
test('M5 — durée TTL expirée = recalcul',async()=>{
 let t=1000,count=0;const cache=createCache({now:()=>t});const compute=async()=>++count;
 assert.equal(await cache.getOrCompute('k',compute,200),1);
 t=1199;assert.equal(await cache.getOrCompute('k',compute,200),1);
 t=1200;assert.equal(await cache.getOrCompute('k',compute,200),2);
});
test('M5 — clés différentes = données différentes',async()=>{
 const cache=createCache();
 assert.equal(await cache.getOrCompute('a',async()=>1,1000),1);
 assert.equal(await cache.getOrCompute('b',async()=>2,1000),2);
});
test('M5 — 12 appels simultanés partagent un seul calcul (single-flight)',async()=>{
 let count=0;const cache=createCache();
 const compute=async()=>{count++;await new Promise(r=>setTimeout(r,15));return 'jeu';};
 const results=await Promise.all(Array.from({length:12},()=>cache.getOrCompute('catalog:all',compute,5000)));
 assert.deepEqual(results,Array(12).fill('jeu'));assert.equal(count,1);
});
test('M5 — invalidate(prefix) vide seulement les clés correspondantes',async()=>{
 let a=0,b=0;const cache=createCache();const cA=async()=>++a,cB=async()=>++b;
 await cache.getOrCompute('catalog:a',cA,1000);await cache.getOrCompute('other:b',cB,1000);
 cache.invalidate('catalog:');
 assert.equal(await cache.getOrCompute('catalog:a',cA,1000),2);
 assert.equal(await cache.getOrCompute('other:b',cB,1000),1);
});
test('M5 — un calcul rejeté ne reste pas en cache',async()=>{
 let calls=0;const cache=createCache();
 await assert.rejects(cache.getOrCompute('boom',async()=>{calls++;throw Error('retry');},1000));
 assert.equal(await cache.getOrCompute('boom',async()=>{calls++;return 42;},1000),42);
 assert.equal(calls,2);
});

test('M5 — invalider une requête en cours empêche le retour de données périmées',async()=>{
 const cache=createCache();let unlock;
 const barrier=new Promise(resolve=>{unlock=resolve;});
 const old=cache.getOrCompute('catalog:all',async()=>{await barrier;return 'old';},1000);
 await Promise.resolve();
 cache.invalidate('catalog:');
 const fresh=await cache.getOrCompute('catalog:all',async()=> 'fresh',1000);
 assert.equal(fresh,'fresh');
 unlock();await old;
 assert.equal(await cache.getOrCompute('catalog:all',async()=> 'wrong',1000),'fresh');
});
