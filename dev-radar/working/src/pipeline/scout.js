import { sanitizeExternalContent } from '../safety/external-content.js';

export function normalizeRawItem(raw) {
  return {
    id: raw.id,
    eventId: raw.eventId,
    project: raw.project,
    title: raw.title,
    body: sanitizeExternalContent(raw.body || ''),
    sourceUrl: raw.url,
    sourceName: raw.sourceName,
    authority: raw.authority || 'community',
    publishedAt: raw.publishedAt,
    updatedAt: raw.updatedAt || null,
    version: raw.version || null,
    origin: raw.origin || 'external',
    category: raw.category || 'blog',
    confidence: raw.confidence ?? 0.7,
    facts: raw.facts || {}
  };
}

export function scoutItems(rawItems, companyContext) {
  return rawItems
    .map(normalizeRawItem)
    .filter(item => companyContext.stack.some(tech => `${item.title} ${item.body}`.toLowerCase().includes(tech.toLowerCase())));
}
