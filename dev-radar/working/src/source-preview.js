import { getBaseFeed } from './sources/source-engine.js';

const items = getBaseFeed();
console.log('\nDEV RADAR - SOURCE PREVIEW\n');
console.log(`Mode: local fixtures | ${items.length} signaux disponibles\n`);
for (const [index, item] of items.slice(0, 5).entries()) {
  console.log(`[${index + 1}] ${item.title}`);
  console.log(`Projet: ${item.project || 'n/a'}`);
  console.log(`Source: ${item.sourceName || 'n/a'} (${item.authority || 'unknown'})`);
  console.log(`Publié: ${item.publishedAt || 'n/a'}`);
  console.log(`URL: ${item.url || 'n/a'}`);
  console.log(`Catégorie: ${item.category || 'n/a'}`);
  console.log('');
}
console.log('Ces données sont la matière brute. Aucun agent ni LLM n\'est intervenu.');
console.log('Votre pipeline devra préserver la provenance avant de décider ce qui mérite le brief.\n');
