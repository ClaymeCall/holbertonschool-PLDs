/**
 * PATCH//ZERO - UNTRUSTED PLAYER INPUT
 * BONUS PX-201 starts here.
 *
 * WHERE THIS RUNS
 * Player ticket -> trust boundary -> agent context
 *
 * INPUT
 * Raw text written by a player. It may contain normal prose OR instructions that
 * try to influence the agent.
 *
 * OUTPUT
 * A representation that preserves the text while making its trust level explicit.
 *
 * The important distinction is DATA vs INSTRUCTION. Do not silently drop the
 * player's message: the support agent still needs to read it.
 */
export function wrapPlayerText(text) {
  // Starter behaviour: raw external text is passed without any trust boundary.
  return {
    data: text,
    instruction: "Texte joueur conservé mais explicitement marqué comme donnée non fiable",
  }
}
