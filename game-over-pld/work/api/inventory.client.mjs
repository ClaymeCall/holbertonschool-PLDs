// ZONE WORK — Mission 3 : communication avec le service Stock distant.
// Gardez l'interface existante et cherchez pourquoi le mode Lent pose problème.
// Les contrats HTTP et les scénarios d'échec sont dans l'énoncé.
export async function reserveStock(items, {
  baseUrl = process.env.INVENTORY_URL || 'http://inventory:4000',
  fetchImpl = fetch,
  timeoutMs = 650
} = {}) {
  try {
    // Observez le comportement si le service distant ne répond pas.
    const response = await fetchImpl(`${baseUrl}/reserve`, {
      method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items})
    });
    const body = await response.json();
    if(!response.ok) return {ok:false,status:response.status,error:body.error||'STOCK_ERROR',...body};
    return {ok:true,stock:body.stock};
  } catch {
    return {ok:false,status:503,error:'INVENTORY_UNAVAILABLE'};
  }
}
