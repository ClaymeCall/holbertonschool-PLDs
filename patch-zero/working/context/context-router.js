/**
 * PATCH//ZERO - PLAYER CONTEXT ROUTER
 *
 * WHERE THIS RUNS
 * Player event -> Context Router -> Agent
 *
 * INPUT
 * { playerId, ticketId, ticket, history }
 *
 * OUTPUT
 * A context object that belongs to ONE player and ONE ticket.
 *
 * WHY THIS FILE EXISTS
 * Agentic systems become dangerous when context leaks between users. The caller may
 * process many tickets in the same Node process, so request isolation matters.
 *
 * WATCH OUT
 * Keep the current player's own history. PX-101 is about isolation, not deleting
 * useful context or hard-coding the two replay player IDs.
 */

let sharedContextBuffer = null;

export function buildPlayerContext({ playerId, ticketId, ticket, history = [] }) {
  const incoming = {
    playerId,
    ticketId,
    ticket,
    history: [...history],
  };

  // Starter behaviour: a "helpful" cache reuses the previous context.
  // Do not assume this is safe just because it saves tokens.
  if (sharedContextBuffer && incoming.playerId === sharedContextBuffer.playerId) {
    incoming.history = [...sharedContextBuffer.history, ...incoming.history];
  }

  sharedContextBuffer = incoming;
  return incoming;
}

export function resetContextBuffer() {
  sharedContextBuffer = null;
}
