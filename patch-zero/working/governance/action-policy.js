/**
 * PATCH//ZERO - ACTION POLICY / HUMAN GATE
 *
 * WHERE THIS RUNS
 * Agent recommendation -> policy -> Human Gate OR executor
 *
 * INPUT
 * An action proposed by an agent, including its type, scope and impact.
 *
 * OUTPUT
 * A policy decision telling the executor whether the action may proceed and whether
 * a human approval is required.
 *
 * WHY THIS FILE EXISTS
 * Recommendation and authorization are different concepts. High-impact actions need
 * deterministic governance outside the LLM prompt.
 *
 * WATCH OUT
 * Do not solve the incident by denying every action. The policy still needs to
 * distinguish safe operations from actions that must wait for a human.
 */

export function evaluateAction(action) {
  const base = {
    actionId: action.actionId,
    type: action.type,
    region: action.region,
    playersAffected: action.playersAffected || 0,
  };

  // Starter behaviour: actions are trusted once an agent labels them "recommended".
  if (action.recommended === true) {
    return { ...base, decision: 'hold', requiresHumanApproval: true, reason: 'agent-recommended' };
  }

  return { ...base, decision: 'deny', requiresHumanApproval: false, reason: 'not-recommended' };
}
