// ZONE WORK — Mission 1 : couche REPOSITORY.
// Cette couche est déjà correcte : utilisez-la depuis le Service, sans données en dur.
// Contrat : createCatalogRepository(source) -> {findAll,findById}.
export function createCatalogRepository(source) {
  return {
    async findAll() { return source.queryCatalog(); },
    async findById(id) { return source.queryGame(id); }
  };
}
