// ZONE WORK — Mission 5 : éviter les lectures répétées et les calculs redondants.
// Respectez le contrat public et les comportements attendus dans l'énoncé.
export function createCache({now = () => Date.now()} = {}) {
  return {
    async getOrCompute(key, compute, ttlMs) {
      // Les lectures répétées sont actuellement coûteuses.
      return compute();
    },
    invalidate(prefix = '') {
      // Vérifiez le comportement après une invalidation.
    }
  };
}
