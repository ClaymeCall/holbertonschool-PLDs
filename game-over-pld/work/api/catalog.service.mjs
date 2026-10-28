// ZONE WORK — Mission 1 : logique du catalogue et dépendances déjà injectées.
// Conservez les signatures/exportations fournies ; le Service ne doit pas gérer HTTP.
// Les comportements attendus sont décrits dans CONSIGNES_ETUDIANTS.md.
export function filterGames(games, {q = '', genre = ''} = {}) {
  // Observez le résultat pour une recherche et un genre combinés.
  const search = q.trim().toLowerCase();
  const selectedGenre = genre.trim().toLowerCase();

  return games.filter(
    (game) => game.title.toLowerCase().trim().includes(search) && (!selectedGenre || game.genre.trim().toLowerCase() === selectedGenre)
  );
}

export function createCatalogService({repository, cache}) {
  return {
    async list({q = '',genre = ''} = {}) {
      // Vérifiez le contrat de cette couche avec les autres modules.
      const games = await cache.getOrCompute('catalog:all', ()=> repository.findAll(), 30_000)

      return filterGames(games, {q, genre});
    },
    async getById(id) {
      return repository.findById(id);
    }
  };
}
