/**
 * PATCH//ZERO - REVIEW LOOP
 *
 * WHERE THIS RUNS
 * Anti-Cheat Agent -> Reviewer -> Anti-Cheat Agent -> ...
 *
 * INPUT
 * initialDecision : the decision that starts the review
 * reviewStep      : async callback representing one reviewer round
 *
 * OUTPUT
 * Final decision + number of turns + accumulated cost + transcript.
 *
 * WHY THIS FILE EXISTS
 * Agent loops need deterministic safety limits. A loop that is logically valid can
 * still be operationally unsafe if it consumes time or budget forever.
 *
 * WATCH OUT
 * Do not hard-code the replay sample. The safety rule must still make sense for
 * another decision or another review callback. Replay PX-102 to observe the contract.
 */

const MAX_REVIEW_TURNS = 4;
const MAX_BUDGET_USD = 0.024;

export async function runReviewLoop({ initialDecision, reviewStep }) {
  let decision = initialDecision;
  let turn = 0;
  let costUsd = 0;
  const transcript = [];

  while (decision.status !== 'approved') {
    turn += 1;
    const result = await reviewStep({ decision, turn });
    decision = result.decision;
    costUsd += Number(result.costUsd || 0);
    transcript.push({ turn, status: decision.status, costUsd: result.costUsd || 0 });

    if (turn >= MAX_REVIEW_TURNS) break;
    if (costUsd >= MAX_BUDGET_USD) break;
  }

  return { decision, turn, costUsd: Number(costUsd.toFixed(4)), transcript };
}
