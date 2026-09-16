import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const requiredSections = ['ROLE','CONTEXT','TASK','BOUNDARIES','OUTPUT'];
const placeholder = /(A COMPLETER|À COMPLÉTER|TODO|TBD|\.\.\.)/i;

function sectionText(text, name) {
  const rx = new RegExp(`##\\s+${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
  return (text.match(rx)?.[1] || '').trim();
}

export function checkAgent(role) {
  const file = path.join(root, 'working', 'agents', `${role}.md`);
  if (!fs.existsSync(file)) return {ok:false, role, message:`working/agents/${role}.md absent`};
  const text = fs.readFileSync(file, 'utf8');
  const missing=[];
  for (const section of requiredSections) {
    const body=sectionText(text,section);
    if (!body || body.length < 18 || placeholder.test(body)) missing.push(section);
  }
  return missing.length ? {ok:false, role, message:`rubriques à compléter: ${missing.join(', ')}`} : {ok:true, role, message:'frontières explicites'};
}

export function checkPipelineFoundation() {
  try {
    const news = JSON.parse(fs.readFileSync(path.join(root,'working/schemas/news-item.schema.json'),'utf8'));
    const analysis = JSON.parse(fs.readFileSync(path.join(root,'working/schemas/analysis.schema.json'),'utf8'));
    const source = JSON.parse(fs.readFileSync(path.join(root,'working/data/base-feed.json'),'utf8'));
    if (!Array.isArray(source) || source.length < 1) return {ok:false, role:'pipeline', message:'aucune source locale disponible'};
    if (!news || !analysis) return {ok:false, role:'pipeline', message:'contrats JSON invalides'};
    return {ok:true, role:'pipeline', message:'sources et contrats lisibles'};
  } catch (error) {
    return {ok:false, role:'pipeline', message:error.message};
  }
}

export function foundationResults() {
  return [checkAgent('scout'), checkAgent('analyst'), checkAgent('editor'), checkPipelineFoundation()];
}

export function foundationReady() { return foundationResults().every(x=>x.ok); }
