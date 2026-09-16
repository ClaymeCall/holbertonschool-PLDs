/**
 * PATCH//ZERO - RUNBOOK CACHE FRESHNESS
 * BONUS PX-204 starts here.
 *
 * WHERE THIS RUNS
 * Cached operational runbook -> freshness gate -> RELEASE GUARD
 *
 * INPUT
 * cachedAt, now: ISO dates
 * maxAgeMinutes: maximum age accepted by the policy
 *
 * OUTPUT
 * true only when the cached procedure is still fresh enough to trust.
 *
 * Replay the mission before changing the code: one sample is intentionally fresh
 * and another intentionally stale.
 */
export function isRunbookUsable({ cachedAt, now, maxAgeMinutes = 30 }) {
  const cacheDate = new Date(cachedAt);
  const nowDate = new Date(now);
  const ageInMinutes = (nowDate - cacheDate) / (1000 * 60);
  return ageInMinutes <= maxAgeMinutes;
}
