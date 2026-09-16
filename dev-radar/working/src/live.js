import { getBaseFeed } from './sources/source-engine.js';
import { runDeterministicPipeline } from './pipeline/orchestrator.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const working=path.resolve(here,'..');
const company=JSON.parse(fs.readFileSync(path.join(working,'context/company-context.json'),'utf8'));
const targets=[['nodejs','node'],['facebook','react'],['docker','cli']];
let items=[];
for(const [owner,repo] of targets){
  try{
    const r=await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=2`,{headers:{'User-Agent':'dev-radar-pld'}});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const releases=await r.json();
    for(const rel of releases) items.push({id:`${owner}/${repo}/${rel.id}`,eventId:`${owner}/${repo}/${rel.tag_name}`,project:repo,title:`${repo} ${rel.tag_name}`,body:rel.body||'',url:rel.html_url,sourceName:'GitHub Releases',authority:'official',publishedAt:rel.published_at||rel.created_at,updatedAt:rel.published_at||rel.created_at,version:rel.tag_name,origin:'external',confidence:0.98,category:'release'});
  }catch(error){console.error(`LIVE source ${owner}/${repo} indisponible: ${error.message}`)}
}
if(!items.length){console.log('Aucune source live disponible - fallback fixtures locales.');items=getBaseFeed();}
console.log(runDeterministicPipeline(items,company).brief);
