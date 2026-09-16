export function dedupeEvents(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.eventId.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
