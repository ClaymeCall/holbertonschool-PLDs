/**
 * PATCH//ZERO - TRACE REDACTION
 * BONUS PX-202 starts here.
 *
 * WHERE THIS RUNS
 * Raw telemetry payload -> redaction -> Trace storage
 *
 * INPUT
 * An arbitrary trace payload that can contain nested player or payment data.
 *
 * OUTPUT
 * The same useful telemetry, without storing sensitive values in clear text.
 *
 * Do not delete the entire payload just to make the checker green: observability
 * must remain useful after redaction.
 */
export function redactTracePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const redacted = structuredClone(payload);

  // Redact player-sensitive fields
  if (redacted.player) {
    if (redacted.player.email) redacted.player.email = '[REDACTED]';
    if (redacted.player.sessionToken) redacted.player.sessionToken = '[REDACTED]';
  }

  // Redact payment-sensitive fields
  if (redacted.paymentRef) redacted.paymentRef = '[REDACTED]';

  return redacted;
}
