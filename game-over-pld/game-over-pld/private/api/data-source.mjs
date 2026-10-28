// Socle pédagogique PROTÉGÉ : simulation d'une source de données lente.
// Aucune modification autorisée. Le délai sert à observer le cache (mission 5).
const seed = Object.freeze([
  {id:'pixel-drift', title:'Mario Kart 8 Deluxe', genre:'Course', priceCents:2990, art:'🏎️', theme:'red', rating:4.9, tag:'BEST-SELLER'},
  {id:'neon-quest', title:"Baldur's Gate 3", genre:'RPG', priceCents:4490, art:'🗡️', theme:'gold', rating:4.9, tag:'GOTY'},
  {id:'astro-raiders', title:'Grand Theft Auto V', genre:'Action', priceCents:3990, art:'🚗', theme:'green', rating:4.8, tag:'CLASSIQUE'},
  {id:'dungeon-bits', title:'Elden Ring', genre:'RPG', priceCents:1990, art:'🐉', theme:'orange', rating:4.8, tag:'SOULS'},
  {id:'galaxy-strike', title:'Cyberpunk 2077', genre:'Action', priceCents:3490, art:'🤖', theme:'yellow', rating:4.6, tag:'NOUVEAU'},
  {id:'speed-runner', title:'Rocket League', genre:'Course', priceCents:2490, art:'⚡', theme:'blue', rating:4.7, tag:'HOT'},
  {id:'farm-pixel', title:'EA Sports FC 26', genre:'Simulation', priceCents:1790, art:'⚽', theme:'lime', rating:4.5, tag:'FIFA'},
  {id:'mecha-arena', title:'Red Dead Redemption 2', genre:'Action', priceCents:5990, art:'🤠', theme:'brown', rating:4.9, tag:'PREMIUM'},
  {id:'witch-hunt', title:'The Witcher 3', genre:'RPG', priceCents:2790, art:'🐺', theme:'silver', rating:4.9, tag:'CULTE'},
  {id:'craft-box', title:'Minecraft', genre:'Simulation', priceCents:2290, art:'🧱', theme:'green', rating:4.8, tag:'CRÉATIF'},
  {id:'crew-mate', title:'Among Us', genre:'Simulation', priceCents:990, art:'🚀', theme:'pink', rating:4.4, tag:'PARTY'},
  {id:'trail-blaze', title:'Forza Horizon 5', genre:'Course', priceCents:3290, art:'🏁', theme:'cyan', rating:4.8, tag:'OPEN WORLD'}
]);
export const GAME_IDS = seed.map(x => x.id);
export const GAMES = seed;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function queryCatalog() {
  await pause(110);
  return seed.map(row => ({...row}));
}
export async function queryGame(id) {
  await pause(35);
  const item = seed.find(x => x.id === id);
  return item ? {...item} : null;
}
