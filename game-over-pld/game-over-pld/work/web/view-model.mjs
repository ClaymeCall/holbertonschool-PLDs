// ZONE WORK — Mission 4 : données de présentation du stock.
// Conservez les signatures exportées ; n'ajoutez pas de dépendance à React.
// Observez les messages erronés dans la boutique avant d'intervenir.
export function stockViewModel(stock) {
  // Comparez les quantités de Stock avec les informations affichées.
  return {label:'En stock',kind:'ok',canBuy:true};
}

export function formatPrice(cents) {
  return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(cents/100);
}
