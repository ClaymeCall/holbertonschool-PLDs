import test from 'node:test';
import assert from 'node:assert/strict';
import {filterGames,createCatalogService} from '../../work/api/catalog.service.mjs';
import {listGames,getGame} from '../../work/api/catalog.controller.mjs';
import {createCatalogRepository} from '../../work/api/catalog.repository.mjs';

const seed=[{id:'a',title:'Neon Quest',genre:'RPG'},{id:'b',title:'Galaxy Strike',genre:'Action'},{id:'c',title:'Retro Quest',genre:'Action'}];
const repository={findAll:async()=>seed,findById:async id=>seed.find(g=>g.id===id)||null};
const cache={getOrCompute:(_key,compute)=>compute()};

test('M1 — Service : recherche insensible à la casse et aux espaces, sans muter la liste',()=>{
 const snapshot=structuredClone(seed);
 assert.deepEqual(filterGames(seed,{q:'  qUeSt  '}).map(x=>x.id),['a','c']);
 assert.deepEqual(seed,snapshot);
});
test('M1 — Service : filtre genre exact insensible à la casse',()=>{
 assert.deepEqual(filterGames(seed,{genre:'action'}).map(x=>x.id),['b','c']);
});
test('M1 — Service : combinaison q ET genre',()=>{
 assert.deepEqual(filterGames(seed,{q:'quest',genre:'action'}).map(x=>x.id),['c']);
});
test('M1 — Service : filtre les données issues du Repository avec un cache',async()=>{
 const calls=[];
 const fakeRepo={findAll:async()=>{calls.push('repo');return seed;},findById:repository.findById};
 const fakeCache={getOrCompute:async(key,compute,ttl)=>{
  calls.push('cache');assert.match(key,/^catalog:/);assert.ok(ttl>0);return compute();
 }};
 const service=createCatalogService({repository:fakeRepo,cache:fakeCache});
 const games=await service.list({q:'quest',genre:'RPG'});
 assert.deepEqual(games.map(x=>x.id),['a']);
 assert.equal(calls.filter(x=>x==='cache').length,1);
 assert.equal(calls.filter(x=>x==='repo').length,1);
});
test('M1 — Controller : aucun repository nécessaire, HTTP 200 et total exact',async()=>{
 let received;
 const service={list:async filters=>{received=filters;return [seed[0]];}};
 const r=await listGames({q:'quest',genre:'RPG',service});
 assert.deepEqual(received,{q:'quest',genre:'RPG'});
 assert.deepEqual(r,{status:200,body:{items:[seed[0]],total:1}});
});
test('M1 — Controller : GET inconnu passe par le Service et traduit en 404',async()=>{
 const r=await getGame({id:'absent',service:{getById:async()=>null}});
 assert.deepEqual(r,{status:404,body:{error:'GAME_NOT_FOUND'}});
});
test('M1 — Controller : GET existant passe par le Service et traduit en 200',async()=>{
 const r=await getGame({id:'a',service:{getById:async id=>seed.find(x=>x.id===id)}});
 assert.deepEqual(r,{status:200,body:seed[0]});
});
test('M1 — Repository : injection de la source (liste et détail)',async()=>{
 const calls=[];
 const repo=createCatalogRepository({queryCatalog:async()=>{calls.push('all');return seed;},queryGame:async id=>{calls.push(id);return {id};}});
 assert.deepEqual(await repo.findAll(),seed);
 assert.deepEqual(await repo.findById('x'),{id:'x'});
 assert.deepEqual(calls,['all','x']);
});
