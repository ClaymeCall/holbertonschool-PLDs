/**
 * PATCH//ZERO - PROVIDER FALLBACK
 * BONUS PX-206 starts here.
 *
 * WHERE THIS RUNS
 * Agent call -> primary provider -> safe fallback when the provider is unavailable
 *
 * INPUT
 * primaryCall  : async function that may succeed or throw
 * fallbackCall : async function that returns a degraded but safe response
 *
 * OUTPUT
 * The result of the primary call, or the safe fallback when the primary fails.
 *
 * WATCH OUT
 * "Catch every error and ignore it" is not resilience. The caller still needs a
 * predictable result. Replay the incident to see the exact contract expected.
 */
export async function withFallback(primaryCall, fallbackCall) {
  // Starter behaviour: a provider outage propagates directly to LiveOps.
  try{
    return await primaryCall()
  }
  catch {
    return await fallbackCall()
  }
}
