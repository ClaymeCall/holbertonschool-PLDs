export function externalEvidence(items) {
  return items.filter(item => item.sourceUrl);
}
