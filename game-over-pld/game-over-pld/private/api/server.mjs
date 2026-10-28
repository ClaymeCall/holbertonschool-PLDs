import http from 'node:http';
import {queryCatalog,queryGame} from './data-source.mjs';
import {createCatalogRepository} from '../../work/api/catalog.repository.mjs';
import {listGames,getGame} from '../../work/api/catalog.controller.mjs';
import {createCatalogService} from '../../work/api/catalog.service.mjs';
import {createCache} from '../../work/api/cache.mjs';
import {checkout} from '../../work/api/order.service.mjs';
import {reserveStock} from '../../work/api/inventory.client.mjs';

const PORT = Number(process.env.PORT||3000);
const INVENTORY_URL = process.env.INVENTORY_URL||'http://inventory:4000';
const repository=createCatalogRepository({queryCatalog,queryGame});
const cache=createCache();
const catalogService=createCatalogService({repository,cache});
const timings=[];
let requests=0;
let failures=0;

function respond(res,status,body){
  if(!Number.isInteger(status)||status<100||status>599)throw new Error('Statut HTTP invalide');
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
  res.end(JSON.stringify(body));
}
async function readBody(req){
  let raw='';
  for await(const c of req){raw+=c;if(raw.length>100_000)throw Object.assign(new Error('Body trop volumineux'),{status:413});}
  try{return raw ? JSON.parse(raw):{};}catch{throw Object.assign(new Error('JSON invalide'),{status:400});}
}
async function inventory(path,{method='GET',body}={}){
  const res=await fetch(`${INVENTORY_URL}${path}`,{
    method,headers:{'content-type':'application/json'},
    ...(body ? {body:JSON.stringify(body)} : {}),
    signal:AbortSignal.timeout(2500)
  });
  return {status:res.status,body:await res.json()};
}
function percentile(values,pct){
  if(values.length===0)return 0;
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.ceil(pct/100*sorted.length)-1];
}
async function simulateTraffic({count=48}={}){
  const n=Math.max(8,Math.min(80,Number(count)||48));
  // Préchauffage hors mesure : la comparaison porte sur le catalogue chaud.
  // Sans cela un premier paquet de requêtes mesure surtout un cache froid.
  try { const warm=await fetch(`http://127.0.0.1:${PORT}/api/games?q=pixel`); await warm.arrayBuffer(); } catch {}
  const start=performance.now();
  const samples=[];
  let cursor=0, successes=0;
  const workers=Array.from({length:Math.min(12,n)},async()=>{
    while(cursor<n){
      cursor++;
      const t0=performance.now();
      try{
        const res=await fetch(`http://127.0.0.1:${PORT}/api/games?q=pixel`);
        if(res.ok)successes++;
        await res.arrayBuffer();
      }catch{/* comptabilisé dans le nombre de succès */}
      samples.push(Math.round((performance.now()-t0)*10)/10);
    }
  });
  await Promise.all(workers);
  const durationMs=Math.round(performance.now()-start);
  return {requests:n,successes,durationMs,p50Ms:percentile(samples,50),p95Ms:percentile(samples,95),requestsPerSecond:Number((n/(Math.max(1,durationMs)/1000)).toFixed(1))};
}
const server=http.createServer(async(req,res)=>{
  const begin=performance.now();
  const originalEnd=res.end.bind(res);
  res.end=function(...args){
    const ms=performance.now()-begin;
    timings.push(ms);if(timings.length>300)timings.shift();
    requests++;if(res.statusCode>=500)failures++;
    return originalEnd(...args);
  };
  try{
    const url=new URL(req.url,`http://localhost:${PORT}`);
    const path=url.pathname;
    if(req.method==='GET'&&path==='/api/health')return respond(res,200,{ok:true,name:'Game Over API',exercise:true});
    if(req.method==='GET'&&path==='/api/games'){
      const result=await listGames({q:url.searchParams.get('q')||'',genre:url.searchParams.get('genre')||'',repository,cache,service:catalogService});
      return respond(res,result.status,result.body);
    }
    if(req.method==='GET'&&path.startsWith('/api/games/')){
      const id=decodeURIComponent(path.slice('/api/games/'.length));
      const result=await getGame({id,repository,service:catalogService});return respond(res,result.status,result.body);
    }
    if(req.method==='GET'&&path==='/api/stocks'){
      const data=await inventory('/stocks');return respond(res,data.status,data.body);
    }
    if(req.method==='POST'&&path==='/api/checkout'){
      const body=await readBody(req);
      const result=await checkout({items:body.items,repository,reserve:items=>reserveStock(items,{baseUrl:INVENTORY_URL})});
      return respond(res,result.status,result.body);
    }
    if(req.method==='POST'&&path==='/api/ops/mode'){
      const body=await readBody(req);
      const data=await inventory('/chaos',{method:'POST',body});return respond(res,data.status,data.body);
    }
    if(req.method==='POST'&&path==='/api/ops/reset'){
      const data=await inventory('/reset',{method:'POST'});
      cache.invalidate('catalog:');return respond(res,data.status,data.body);
    }
    if(req.method==='GET'&&path==='/api/ops/state'){
      const data=await inventory('/state');return respond(res,data.status,{...data.body,requests,failures,p95Ms:Math.round(percentile(timings,95))});
    }
    if(req.method==='POST'&&path==='/api/ops/load'){
      const result=await simulateTraffic(await readBody(req));return respond(res,200,result);
    }
    return respond(res,404,{error:'ROUTE_NOT_FOUND',path});
  } catch(error){
    if(res.headersSent)return res.end();
    const status=error.status|| (error.name==='TimeoutError'?503:500);
    console.error('[api]',error);
    return respond(res,status,{error:status===503?'SERVICE_UNAVAILABLE':status===400?'BAD_REQUEST':'INTERNAL_ERROR',message:error.message});
  }
});
server.listen(PORT,'0.0.0.0',()=>console.log(`[api] listening on ${PORT}`));
