// ZONE WORK — Mission 1 : le catalogue répond mal et les responsabilités sont mélangées.
// Conservez les signatures exportées. Les tests fourniront parfois seulement un Service.
// Enquêtez sur la frontière entre HTTP, logique métier et données.
export async function listGames({q = '',genre = '', repository, cache, service}) {
  // La recherche ne renvoie pas toujours les résultats attendus.
  const games = await service.list({q, genre});
  return {status:200,body:{items:games,total:games.length}};
}

export async function getGame({id,repository,service}) {
  // Le traitement des fiches manquantes doit être vérifié.
  const game = await service.getById(id);

  if (!game){
    return {status:404,body:{error:'GAME_NOT_FOUND'}};
  }

  return {status:200,body:game};
}
