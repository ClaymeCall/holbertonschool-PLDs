// ZONE WORK — Mission 2 : règles du domaine Commandes.
// Ces fonctions doivent rester indépendantes du serveur, du réseau et de l'accès aux données.
// Conservez leurs noms et signatures ; identifiez les erreurs à partir des scénarios du TP.
export function validateBasket(items) {
  if (!Array.isArray(items) || items.length===0) return {ok:false,error:'EMPTY_BASKET'};
  // Vérifiez les cas limites du panier.
  return {ok:true};
}

export function priceLines(items,games) {
  // Vérifiez la source des données de chaque ligne.
  return items.map((item,i)=>({id:games[i].id,title:games[i].title,quantity:item.quantity,unitPriceCents:item.unitPriceCents ?? games[i].priceCents}));
}
