/**
 * PATCH//ZERO - AGENT TOOL PERMISSIONS
 * BONUS PX-205 starts here.
 *
 * WHERE THIS RUNS
 * Agent identity -> tools exposed to that agent
 *
 * INPUT
 * agentId such as "support" or "release"
 *
 * OUTPUT
 * An array of tool ids. The ÉQUIPE IA screen reads THIS function through the
 * backend, so after a successful correction the permissions displayed in the UI
 * change too.
 *
 * PRINCIPLE
 * A prompt saying "do not rollback production" is not a permission system.
 * Give each role only the tools it really needs.
 */
export function toolsForAgent(agentId) {
  switch (agentId) {
    case 'support':
      return ['read_ticket', 'read_player'];
    case 'release':
      return ['rollback_global'];
    default:
      return [];
  }
}
