export function validateNewsItem(item) {
  if (!item || !item.title) return { ok: false, errors: ['title'] };
  return { ok: true, errors: [] };
}

export function assertNewsItems(items) {
  const invalid = items.map((item, index) => ({ index, ...validateNewsItem(item) })).filter(x => !x.ok);
  if (invalid.length) {
    const error = new Error('AGENT_CONTRACT_INVALID');
    error.details = invalid;
    throw error;
  }
  return items;
}
