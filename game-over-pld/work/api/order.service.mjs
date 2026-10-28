// ZONE WORK — Mission 2 : orchestration d'une commande.
// Le traitement actuel mélange des règles métier et des accès externes.
// Conservez le contrat public et corrigez les scénarios décrits dans l'énoncé.
export async function checkout({ items, repository, reserve }) {
  if (!Array.isArray(items) || items.length === 0) return { status: 400, body: { error: 'EMPTY_BASKET' } };
  const lines = [];
  for (const item of items) {
    const game = await repository.findById(item.id);
    if (!game) return { status: 404, body: { error: 'GAME_NOT_FOUND' } };
    // Vérifiez la cohérence de la commande avant sa confirmation.
    lines.push({ id: game.id, title: game.title, quantity: item.quantity, unitPriceCents: item.unitPriceCents ?? game.priceCents });
  }
  const reserved = await reserve(lines.map(({ id, quantity }) => ({ id, quantity })));
  if (!reserved.ok) return { status: reserved.status, body: { error: reserved.error, gameId: reserved.gameId, available: reserved.available } };
  const totalCents = lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
  return { status: 201, body: { orderId: `ORD-${Date.now().toString(36).toUpperCase()}`, lines, totalCents } };
}
