import http from 'node:http';
import {GAME_IDS} from '../api/data-source.mjs';
const start = {'pixel-drift':7,'neon-quest':4,'astro-raiders':9,'dungeon-bits':2,'galaxy-strike':0,'speed-runner':8,'farm-pixel':12,'mecha-arena':3,'witch-hunt':6,'craft-box':15,'crew-mate':20,'trail-blaze':5};
let stock = {...start};
let mode = 'normal';
const json = (res,status,body) => {res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(body));};
async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {raw += chunk;if(raw.length>40000)throw new Error('Body trop volumineux');}
  return raw ? JSON.parse(raw) : {};
}
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    if(req.method==='GET' && url.pathname==='/health') return json(res,200,{ok:true,service:'inventory'});
    if(req.method==='GET' && url.pathname==='/state') return json(res,200,{mode,stock});
    if(req.method==='POST' && url.pathname==='/reset') {stock={...start};mode='normal';return json(res,200,{ok:true,stock,mode});}
    if(req.method==='POST' && url.pathname==='/chaos') {
      const body=await readJson(req);
      if(!['normal','slow','down'].includes(body.mode))return json(res,400,{error:'Mode invalide'});
      mode=body.mode;return json(res,200,{ok:true,mode});
    }
    if(req.method==='GET' && url.pathname==='/stocks') {
      return json(res,200,{stock});
    }
    if(req.method==='POST' && url.pathname==='/reserve') {
      if(mode==='slow'){await sleep(1600);if(res.destroyed)return;}
      if(mode==='down')return json(res,503,{error:'INVENTORY_UNAVAILABLE',message:'Service stock indisponible'});
      const body=await readJson(req);
      const items=body.items;
      if(!Array.isArray(items)||items.length===0) return json(res,400,{error:'INVALID_ITEMS'});
      const seen=new Set();
      for(const item of items){
        if(!item||!GAME_IDS.includes(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||seen.has(item.id)){
          return json(res,400,{error:'INVALID_ITEMS'});
        }
        seen.add(item.id);
      }
      for(const item of items){
        if(stock[item.id] < item.quantity) return json(res,409,{error:'OUT_OF_STOCK',gameId:item.id,available:stock[item.id]});
      }
      // Réservation atomique dans la boucle événementielle de cette démo (stock mémoire).
      for(const item of items) stock[item.id]-=item.quantity;
      return json(res,200,{ok:true,stock});
    }
    return json(res,404,{error:'NOT_FOUND'});
  }catch(error){return json(res,400,{error:'BAD_REQUEST',message:error.message});}
});
server.listen(Number(process.env.PORT||4000),'0.0.0.0',()=>console.log('[inventory] running'));
