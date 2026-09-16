export function analyzeItem(item, companyContext) {
  let priority = 'P2';
  const text = `${item.title} ${item.body}`.toLowerCase();
  if (text.includes('security') || text.includes('cve') || text.includes('breaking')) priority = 'P0';
  else if (item.category === 'release') priority = 'P1';

  const confidence = Math.min(1, (item.confidence ?? 0.5) + 0.2);

  return {
    id: item.id,
    title: item.title,
    priority,
    reason: priority === 'P0' ? 'Impact direct possible sur la stack' : 'Signal technique a surveiller',
    confidence,
    verified: confidence >= 0.7,
    facts: item.facts || {},
    sources: item.sourceUrl ? [{ url: item.sourceUrl, authority: item.authority, origin: item.origin }] : [],
    sourceItem: item
  };
}
