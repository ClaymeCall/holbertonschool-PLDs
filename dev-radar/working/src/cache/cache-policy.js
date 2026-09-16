export function evaluateCacheEntry(entry, policy, now) {
  if (!entry) return { usable: false, stale: true, reason: 'missing' };
  return { usable: true, stale: false, reason: 'cached' };
}
