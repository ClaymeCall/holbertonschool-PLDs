// ZONE WORK — Mission 1 : logique du catalogue et dépendances déjà injectées.
// Conservez les signatures/exportations fournies ; le Service ne doit pas gérer HTTP.
// Les comportements attendus sont décrits dans CONSIGNES_ETUDIANTS.md.
export function filterGames(games, {q = '', genre = ''} = {}) {
  // Observez le résultat pour une recherche et un genre combinés.
  return games;
}

export function createCatalogService({repository,cache}) {
  return {
    async list({q = '',genre = ''} = {}) {
      // Vérifiez le contrat de cette couche avec les autres modules.
      return repository.findAll();
    },
    async getById(id) {
      return repository.findById(id);
    }
  };
}
