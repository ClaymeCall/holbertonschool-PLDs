import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getState, replay, runCheck, reset } from '../../private/engine.js';
const here=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(here,'public');
const port=Number(process.env.PORT||4188);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
function json(res,status,data){res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(data));}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host}`);
  if(url.pathname==='/api/health') return json(res,200,{ok:true,service:'dev-radar',mode:'zero-budget-local'});
  if(url.pathname==='/api/state') return json(res,200,getState());
  if(url.pathname==='/api/reset' && req.method==='POST') return json(res,200,reset());
  const replayMatch=url.pathname.match(/^\/api\/incidents\/(RAD-\d{3})\/replay$/);
  if(replayMatch && req.method==='POST') return json(res,200,replay(replayMatch[1]));
  const checkMatch=url.pathname.match(/^\/api\/incidents\/(RAD-\d{3})\/check$/);
  if(checkMatch && req.method==='POST') return json(res,200,await runCheck(checkMatch[1]));
  let file=url.pathname==='/'?'index.html':url.pathname.slice(1);
  file=path.normalize(file).replace(/^\.\.(\/|\\|$)/,'');
  const target=path.join(publicDir,file);
  if(!target.startsWith(publicDir)||!fs.existsSync(target)||fs.statSync(target).isDirectory()){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(res);
});
server.listen(port,()=>console.log(`DEV RADAR Ops Room -> http://localhost:${port}`));
