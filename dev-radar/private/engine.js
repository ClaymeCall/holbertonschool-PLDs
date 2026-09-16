import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checks } from './checks.js';
import { foundationReady, foundationResults } from './foundation.js';
const here=path.dirname(fileURLToPath(import.meta.url));
const runtime=path.join(here,'runtime');
const incidents=JSON.parse(fs.readFileSync(path.join(here,'incidents.json'),'utf8'));
export const CORE_IDS=['RAD-101','RAD-102','RAD-104','RAD-106','RAD-111','RAD-115'];
function readJson(file,fallback){ try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return fallback;} }
function writeJson(file,data){ fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n'); }
function coreComplete(status){return CORE_IDS.every(id=>status[id]?.cleared);}
function unlockedFor(status,id){if(CORE_IDS.includes(id))return foundationReady();return foundationReady()&&coreComplete(status);}
export function getState(){
  const status=readJson(path.join(runtime,'status.json'),{});const active=readJson(path.join(runtime,'active.json'),{id:null,lastReplay:null});
  const cleared=incidents.filter(x=>status[x.id]?.cleared).length;const coreCleared=CORE_IDS.filter(id=>status[id]?.cleared).length;const foundation=foundationResults();
  return {incidents:incidents.map(x=>({...x,core:CORE_IDS.includes(x.id),unlocked:unlockedFor(status,x.id),status:status[x.id]||null})),active,foundation,foundationReady:foundation.every(x=>x.ok),cleared,total:incidents.length,coreCleared,coreTotal:CORE_IDS.length,bonusUnlocked:coreComplete(status),readiness:Math.round(coreCleared/CORE_IDS.length*100),certified:coreComplete(status)};
}
export async function runCheck(id,{persist=true}={}){
  const status=readJson(path.join(runtime,'status.json'),{});if(!checks[id])throw new Error('UNKNOWN_INCIDENT');
  if(!unlockedFor(status,id)&&persist)return {id,ok:false,locked:true,message:foundationReady()?'CORE 6/6 requis pour les bonus':'Foundation non validee'};
  let ok=true,message='CLEARED';try{await checks[id]();}catch(error){ok=false;message=error.message;}
  if(persist){const previous=status[id]||{attempts:0};status[id]={cleared:ok,attempts:(previous.attempts||0)+1,lastMessage:message,checkedAt:new Date().toISOString()};writeJson(path.join(runtime,'status.json'),status);const hist=readJson(path.join(runtime,'history.json'),[]);hist.push({type:'CHECK',id,ok,message,at:new Date().toISOString()});writeJson(path.join(runtime,'history.json'),hist);}
  return {id,ok,message};
}
export function replay(id){const status=readJson(path.join(runtime,'status.json'),{});if(!unlockedFor(status,id))return {id,ok:false,locked:true,message:foundationReady()?'CORE 6/6 requis pour les bonus':'Foundation non validee'};const inc=incidents.find(x=>x.id===id);const active={id,lastReplay:new Date().toISOString(),symptom:inc.symptom,topic:inc.topic};writeJson(path.join(runtime,'active.json'),active);return {id,ok:true,evidence:active};}
export async function validateAll(){const results=[];for(const inc of incidents)results.push(await runCheck(inc.id,{persist:false}));return results;}
export function reset(){writeJson(path.join(runtime,'status.json'),{});writeJson(path.join(runtime,'active.json'),{id:null,lastReplay:null});writeJson(path.join(runtime,'history.json'),[]);return getState();}
