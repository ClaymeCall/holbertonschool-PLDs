import test from 'node:test';
import assert from 'node:assert/strict';
import {checkout} from '../../work/api/order.service.mjs';
import {validateBasket,priceLines} from '../../work/api/order.domain.mjs';
const seed={a:{id:'a',title:'Pixel Drift',priceCents:2990},b:{id:'b',title:'Neon Quest',priceCents:4500}};
const repository={findById:async id=>seed[id]||null};
const make=(items,reserve=async()=>({ok:true,stock:{a:5,b:4}}))=>checkout({items,repository,reserve});

test('M2 — Domaine pur : refuse le panier vide',()=>{
 for(const items of [[],undefined,{},null])assert.deepEqual(validateBasket(items),{ok:false,error:'EMPTY_BASKET'});
});
for(const qty of [0,-1,1.5,6,'2',null]){
 test(`M2 — Domaine pur : refuse quantité ${String(qty)}`,()=>{
  assert.deepEqual(validateBasket([{id:'a',quantity:qty}]),{ok:false,error:'INVALID_QUANTITY'});
 });
}
test('M2 — Domaine pur : interdit les doublons',()=>{
 assert.deepEqual(validateBasket([{id:'a',quantity:1},{id:'a',quantity:2}]),{ok:false,error:'DUPLICATE_GAME'});
});
test('M2 — Domaine pur : accepte les quantités entre 1 et 5',()=>{
 assert.deepEqual(validateBasket([{id:'a',quantity:1},{id:'b',quantity:5}]),{ok:true});
});
test('M2 — Domaine pur : calcule les lignes sans faire confiance au client',()=>{
 const cart=[{id:'a',quantity:2,unitPriceCents:1},{id:'b',quantity:1,unitPriceCents:99999}];
 const copy=structuredClone(cart);
 assert.deepEqual(priceLines(cart,[seed.a,seed.b]),[
  {id:'a',title:'Pixel Drift',quantity:2,unitPriceCents:2990},
  {id:'b',title:'Neon Quest',quantity:1,unitPriceCents:4500}
 ]);
 assert.deepEqual(cart,copy);
});
test('M2 — Application : panier invalide rejete avant le repository et Stock',async()=>{
 let queried=false, reserved=false;
 const r=await checkout({items:[{id:'a',quantity:0}],repository:{findById:async()=>{queried=true;}},reserve:async()=>{reserved=true;return {ok:true};}});
 assert.equal(r.status,400);assert.equal(r.body.error,'INVALID_QUANTITY');
 assert.equal(queried,false);assert.equal(reserved,false);
});
test('M2 — Application : jeu inconnu 404 avant réservation',async()=>{
 let reserved=false;
 const r=await make([{id:'unknown',quantity:1}],async()=>{reserved=true;return {ok:true};});
 assert.equal(r.status,404);assert.equal(r.body.error,'GAME_NOT_FOUND');assert.equal(reserved,false);
});
test('M2 — Application : réserve une seule fois puis confirme avec prix serveur',async()=>{
 const calls=[];
 const r=await make([{id:'a',quantity:2,unitPriceCents:1},{id:'b',quantity:1}],async items=>{
  calls.push(items);return {ok:true,stock:{a:3,b:4}};
 });
 assert.equal(r.status,201);assert.equal(r.body.totalCents,10480);
 assert.deepEqual(calls,[[{id:'a',quantity:2},{id:'b',quantity:1}]]);
 assert.equal(r.body.lines[0].unitPriceCents,2990);
 assert.match(r.body.orderId,/^ORD-/);
});
test('M2 — Application : 409 Stock sans fausse confirmation',async()=>{
 const r=await make([{id:'a',quantity:2}],async()=>({ok:false,status:409,error:'OUT_OF_STOCK',gameId:'a',available:1}));
 assert.equal(r.status,409);assert.equal(r.body.error,'OUT_OF_STOCK');assert.equal(r.body.orderId,undefined);
});
test('M2 — Application : 503 Stock sans fausse confirmation',async()=>{
 const r=await make([{id:'a',quantity:1}],async()=>({ok:false,status:503,error:'INVENTORY_UNAVAILABLE'}));
 assert.equal(r.status,503);assert.equal(r.body.error,'INVENTORY_UNAVAILABLE');assert.equal(r.body.orderId,undefined);
});
