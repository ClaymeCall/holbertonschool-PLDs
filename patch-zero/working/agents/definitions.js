/**
 * Agents are already provided on purpose.
 * This PLD is about operating and governing an Agentic system, not rebuilding
 * another PO -> DEV -> QA chain from scratch.
 */
export const AGENTS = {
  support: {
    id: 'support',
    name: 'PLAYER SUPPORT',
    role: 'Trier les tickets joueurs et recommander la prochaine action de support.',
    boundaries: 'Ne jamais exécuter de sanction sur un compte. Ne jamais réutiliser le contexte d’un autre joueur.',
    accent: '#56d6ff',
  },
  anticheat: {
    id: 'anticheat',
    name: 'ANTI-CHEAT',
    role: 'Évaluer les preuves de gameplay suspect et produire une décision vérifiable.',
    boundaries: 'Ne jamais boucler indéfiniment avec un reviewer. Escalader l’incertitude.',
    accent: '#b18cff',
  },
  economy: {
    id: 'economy',
    name: 'ECONOMY WATCH',
    role: 'Détecter les comportements anormaux de la marketplace et de la monnaie du jeu.',
    boundaries: 'Ne jamais modifier directement la marketplace.',
    accent: '#ffcf5a',
  },
  release: {
    id: 'release',
    name: 'RELEASE GUARD',
    role: 'Comparer les symptômes live au manifeste officiel de release et recommander une mitigation.',
    boundaries: 'Les données officielles de release gagnent toujours sur les résumés générés. Toute action globale exige une validation humaine.',
    accent: '#ff647c',
  },
};
