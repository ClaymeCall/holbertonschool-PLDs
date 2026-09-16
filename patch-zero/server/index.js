import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkAll, checkMission, getMissions } from '../private/checks.js';
import { buildEvidence } from '../private/evidence.js';
import { providerStatus, askAgent } from '../working/ai/provider.js';
import { AGENTS } from '../working/agents/definitions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const hints = JSON.parse(fs.readFileSync(path.join(ROOT, 'private/hints.json'), 'utf8'));
const missionIds = new Set(getMissions().map(mission => mission.id));

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function assertKnownMission(id) {
  if (!missionIds.has(id)) throw new HttpError(404, `Unknown mission: ${id}`);
}

async function freshWorking(rel) {
  // Student files are edited while the server is running. Cache-busting the ESM
  // import lets the UI reflect those edits after a Check without restarting Node.
  const href = pathToFileURL(path.join(ROOT, rel)).href + `?v=${Date.now()}-${Math.random()}`;
  return import(href);
}

async function safeEvidence(id, fallback = {}) {
  // Bootstrap must survive a temporary syntax/runtime error in student code.
  // Replay/Check still report the real error, but the whole dashboard stays usable.
  try { return await buildEvidence(id); }
  catch (error) { return { id, passed:false, observed:'student-code-error', error:error.message, ...fallback }; }
}

function parseEnvPort() {
  // Environment variables provided by the shell/CI take priority over .env,
  // matching the provider configuration behaviour.
  let filePort = null;
  const f = path.join(ROOT, '.env');
  if (fs.existsSync(f)) {
    for (const raw of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line.startsWith('PORT=')) continue;
      filePort = Number(line.slice('PORT='.length).trim());
      break;
    }
  }
  const candidate = process.env.PORT !== undefined ? Number(process.env.PORT) : filePort;
  return Number.isInteger(candidate) && candidate > 0 && candidate <= 65535 ? candidate : 4177;
}

const MIME = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'
};
function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'content-type':'application/json; charset=utf-8', 'content-length': Buffer.byteLength(data), 'cache-control':'no-store' });
  res.end(data);
}
async function readBody(req, maxBytes = 1_000_000) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) throw new HttpError(413, 'Request body too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'Invalid JSON body'); }
}

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const out = path.normalize(path.join(PUBLIC, clean || 'index.html'));
  return out === PUBLIC || out.startsWith(PUBLIC + path.sep) ? out : null;
}

async function bootstrap() {
  const missionDefs = getMissions();
  // A work-in-progress syntax error must not take the whole Mission Control down.
  // We isolate each checker so only the affected mission remains failed.
  const checks = [];
  for (const mission of missionDefs) {
    try { checks.push(await checkMission(mission.id)); }
    catch (error) { checks.push({ id:mission.id, passed:false, error:error.message }); }
  }
  const missionRows = missionDefs.map(m => ({ ...m, passed: Boolean(checks.find(c=>c.id===m.id)?.passed) }));
  const core = missionRows.filter(m=>m.tier==='CORE');
  const corePassed = core.filter(m=>m.passed).length;
  const px102 = await safeEvidence('PX-102');
  const px104 = await safeEvidence('PX-104');
  const px105 = await safeEvidence('PX-105');
  let permissions = Object.fromEntries(Object.keys(AGENTS).map(id => [id, []]));
  let permissionLoadError = null;
  try {
    const { toolsForAgent } = await freshWorking('working/governance/tool-permissions.js');
    permissions = Object.fromEntries(Object.keys(AGENTS).map(id => [id, toolsForAgent(id)]));
  } catch (error) {
    permissionLoadError = error.message;
  }
  const openCore = core.length - corePassed;
  return {
    provider: providerStatus(),
    missions: missionRows,
    agents: Object.values(AGENTS),
    permissions,
    permissionLoadError,
    ops: {
      playersOnline: 248319,
      serverHealth: Number((97.8 + corePassed * 0.35).toFixed(1)),
      aiCost: Number((1.82 - corePassed * 0.07).toFixed(2)),
      openIncidents: openCore,
      corePassed,
      coreTotal: core.length,
      reliability: Math.min(99, 52 + corePassed * 7.5),
      shards: [
        {id:'EU-01',region:'EU',status:'healthy',load:72},{id:'EU-02',region:'EU',status:'healthy',load:63},{id:'EU-03',region:'EU',status: corePassed>=4?'healthy':'degraded',load:91},
        {id:'US-01',region:'US',status:'healthy',load:58},{id:'US-02',region:'US',status:'healthy',load:66},{id:'AS-01',region:'ASIA',status:corePassed>=2?'healthy':'warning',load:79},
      ]
    },
    traces: [
      {id:'tr_8180',time:'15:02:54',agent:'ROUTER',status:'ok',tokens:118,latency:82,model:'routing-rule',spans:2},
      {id:'tr_8181',time:'15:03:01',agent:'ECONOMY WATCH',status:px104.passed?'ok':'incomplete',tokens:px104.passed?1056:null,latency:921,model:px104.passed?'openrouter/free':'unknown',spans:px104.passed?4:1},
      {id:'tr_8182',time:'15:03:19',agent:'PLAYER SUPPORT',status:'ok',tokens:642,latency:418,model:'openrouter/free',spans:3},
      {id:'tr_8183',time:'15:04:11',agent:'ANTI-CHEAT',status:px102.passed?'ok':'warning',tokens:px102.passed?1384:5831,latency:px102.passed?1180:2940,model:'openrouter/free',spans:px102.passed?4:11}
    ],
    approvals: [{
      id:'A-7701', type:'GLOBAL_ROLLBACK', region:'ALL REGIONS', playersAffected:248319,
      status:px105.passed?'awaiting-human':'unsafe-auto-allow', requestedBy:'RELEASE GUARD', confidence:0.71,
      reason:'Pic d’erreurs multi-shards après le hotfix de la Saison 7', policy:px105.observed
    }]
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {
        'content-type':'text/event-stream; charset=utf-8',
        'cache-control':'no-cache, no-transform',
        'connection':'keep-alive',
        'x-accel-buffering':'no'
      });
      res.write('retry: 3000\n\n');
      const feed = [
        {kind:'shard', tone:'ok', title:'EU-OUEST-01 stable', detail:'62 481 joueurs · 18 ms · aucune perte de paquets'},
        {kind:'agent', tone:'ai', title:'ANTI-CHEAT analyse un lot', detail:'18 signalements · décision en attente de REVIEWER'},
        {kind:'economy', tone:'warn', title:'Pic marketplace détecté', detail:'Cristaux lunaires +14 % sur 5 min · surveillance renforcée'},
        {kind:'release', tone:'ok', title:'Build 7.4.2 confirmé', detail:'Manifeste officiel synchronisé sur 12 régions'},
        {kind:'support', tone:'ai', title:'PLAYER SUPPORT traite la file', detail:'27 tickets actifs · délai médian 42 s'},
        {kind:'infra', tone:'ok', title:'Redis / Queue stable', detail:'Profondeur 31 · worker lag 84 ms'},
      ];
      let idx = Math.floor(Math.random()*feed.length);
      const emit = () => {
        const item = feed[idx++ % feed.length];
        const payload = { ...item, id:Date.now(), time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}) };
        res.write(`event: ops\ndata: ${JSON.stringify(payload)}\n\n`);
      };
      emit();
      const timer = setInterval(emit, 4600);
      req.on('close',()=>clearInterval(timer));
      return;
    }
    if (url.pathname === '/api/bootstrap' && req.method === 'GET') return sendJson(res,200,await bootstrap());
    if (url.pathname === '/api/provider' && req.method === 'GET') return sendJson(res,200,providerStatus());
    if (url.pathname.startsWith('/api/evidence/') && req.method === 'GET') {
      const id=url.pathname.split('/').pop(); assertKnownMission(id); return sendJson(res,200,await buildEvidence(id));
    }
    if (url.pathname.startsWith('/api/check/') && req.method === 'POST') {
      const id=url.pathname.split('/').pop(); assertKnownMission(id); return sendJson(res,200,await checkMission(id));
    }
    if (url.pathname.startsWith('/api/hint/') && req.method === 'GET') {
      const [, , , id, levelRaw] = url.pathname.split('/');
      assertKnownMission(id);
      const level=Math.max(1,Math.min(3,Number(levelRaw)||1));
      return sendJson(res,200,{id,level,text:hints[id]?.[level-1]||'No hint available.'});
    }
    if (url.pathname === '/api/agent/test' && req.method === 'POST') {
      const body=await readBody(req);
      if (body.agentId && !AGENTS[body.agentId]) throw new HttpError(400, `Unknown agent: ${body.agentId}`);
      const agent=AGENTS[body.agentId]||AGENTS.support;
      const system=`You are ${agent.name} for Eclipse Realms LiveOps. Role: ${agent.role} Boundaries: ${agent.boundaries} Answer in 4 concise lines. Never claim you executed an action.`;
      const out=await askAgent({agentId:agent.id,system,input:String(body.input||'Describe your role and one boundary.')});
      return sendJson(res,200,{agent,out});
    }
    if (url.pathname === '/api/health' && req.method === 'GET') return sendJson(res,200,{ok:true,name:'PATCH//ZERO'});

    const file = safePath(url.pathname);
    if (!file) { res.writeHead(403); return res.end('Forbidden'); }
    let target=file;
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) target=path.join(PUBLIC,'index.html');
    const ext=path.extname(target);
    const buf=fs.readFileSync(target);
    res.writeHead(200,{'content-type':MIME[ext]||'application/octet-stream','content-length':buf.length,'cache-control':'no-store'});
    res.end(buf);
  } catch (err) {
    console.error(err);
    sendJson(res,err.status || 500,{error:err.message||String(err)});
  }
});

const PORT=parseEnvPort();
server.listen(PORT,'127.0.0.1',()=>{
  console.log(`\nPATCH//ZERO // LIVEOPS COMMAND CENTER`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Mode: ${providerStatus().live ? 'LIVE AI' : 'FIXTURE SAFE MODE'} (${providerStatus().provider})\n`);
});
