export function editAnalysis(analysis) {
  const confidence = Math.min(1, analysis.confidence + 0.15);
  const facts = { ...analysis.facts };
  if (analysis.title) {
    const words = analysis.title.split(/\s+/);
    facts.subject = words.slice(-2).join(' ');
  }
  return {
    title: analysis.title,
    priority: analysis.priority,
    reason: analysis.reason,
    confidence,
    verified: confidence >= 0.7,
    facts,
    sources: analysis.sources
  };
}

export function renderBrief(items, warnings = []) {
  const lines = ['# DEV RADAR', ''];
  for (const warning of warnings) lines.push(`> WARNING: ${warning}`, '');
  for (const item of items.filter(x => x.priority !== 'IGNORE')) {
    lines.push(`## ${item.priority} - ${item.title}`);
    lines.push(item.reason);
    lines.push(`Confidence: ${item.confidence.toFixed(2)}`);
    if (item.sources?.[0]?.url) lines.push(`Source: ${item.sources[0].url}`);
    lines.push('');
  }
  return lines.join('\n');
}
