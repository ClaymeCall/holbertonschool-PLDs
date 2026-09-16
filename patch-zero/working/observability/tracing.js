/**
 * PATCH//ZERO - AGENT TRACE NORMALIZER
 *
 * WHERE THIS RUNS
 * Every agent call -> Trace Explorer
 *
 * INPUT
 * Identifiers, parent span, agent/provider/model metadata, usage, decision, source
 * references and timestamps for one agent operation.
 *
 * OUTPUT
 * A normalized trace object that keeps enough context to explain the decision.
 *
 * WHY THIS FILE EXISTS
 * A 200 HTTP response is not observability. When an agent makes a bad decision,
 * operators need lineage, model/cost metadata and the evidence used.
 *
 * WATCH OUT
 * Preserve the telemetry contract rather than inventing values. Replay PX-104 to
 * see which fields disappear in the starter.
 */

export function normalizeTrace({ traceId, spanId, parentSpanId, agent, provider, model, promptHash, usage, decision, sourceRefs, startedAt, endedAt }) {
  return {
    traceId,
    spanId,
    agent,
    startedAt,
    endedAt,
    status: 'ok',
    parentSpanId,
    provider,
    model,
    promptHash,
    usage,
    decision,
    sourceRefs
  };
}
