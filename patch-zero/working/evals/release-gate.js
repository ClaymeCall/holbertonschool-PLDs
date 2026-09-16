/**
 * PATCH//ZERO - RELEASE EVAL GATE
 *
 * WHERE THIS RUNS
 * Prompt/config change -> eval suite -> release decision
 *
 * INPUT
 * baselinePassRate : quality before the candidate change
 * currentPassRate  : quality measured on the candidate
 * criticalFailures : named behaviours that must never regress silently
 *
 * OUTPUT
 * { allowed, reason, ...metrics } used by the release pipeline.
 *
 * WHY THIS FILE EXISTS
 * A globally "good" score can hide a serious regression. Release gates should
 * compare against the baseline and protect critical behaviours explicitly.
 *
 * WATCH OUT
 * Avoid a rule that passes only the replay fixture. PX-106 exercises both a
 * regression and a genuine improvement.
 */

export function canRelease({ baselinePassRate, currentPassRate, criticalFailures = [] }) {
  // Starter behaviour: only the current global score is considered.
  const allowed = currentPassRate >= 0.94;
  return {
    allowed,
    reason: allowed ? 'current-score-acceptable' : 'current-score-too-low',
    baselinePassRate,
    currentPassRate,
    criticalFailures,
  };
}
