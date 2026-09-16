/**
 * PATCH//ZERO - SINGLE SOURCE OF TRUTH
 *
 * WHERE THIS RUNS
 * Official patch manifest + generated agent summary -> Release Guard
 *
 * INPUT
 * officialManifest : structured release data owned by the game/release system
 * agentSummary     : useful generated prose that may be stale or wrong
 *
 * OUTPUT
 * One resolved patch fact with an explicit `source`.
 *
 * WHY THIS FILE EXISTS
 * Fluent text is not automatically authoritative. Production agents need a clear
 * precedence rule when generated content conflicts with trusted system data.
 *
 * WATCH OUT
 * Keep the returned shape useful to the caller. PX-103 checks the source and the
 * resolved fact, not a hard-coded sentence.
 */

export function resolvePatchFact({ officialManifest, agentSummary }) {
  // Starter behaviour: the most fluent answer wins.
  return officialManifest? {
    source: 'official-manifest',
    patchId: officialManifest.patchId,
    feature: officialManifest.feature,
    enabled: officialManifest.enabled,
    notes: officialManifest.notes,
  }:
  {
    source: 'agent-summary',
    patchId: agentSummary.patchId,
    feature: agentSummary.feature,
    enabled: agentSummary.enabled,
    notes: agentSummary.notes,
  };
}
