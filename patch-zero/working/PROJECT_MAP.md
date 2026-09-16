# PATCH//ZERO - Carte du projet

Vous n'avez pas besoin d'explorer tout le repository avant de commencer. Chaque mission indique le **fichier exact** dans lequel démarrer.

```text
working/
|
+-- context/
|   +-- context-router.js       PX-101 - isoler le contexte joueur
|
+-- orchestration/
|   +-- review-loop.js          PX-102 - arrêter les boucles agentiques
|
+-- knowledge/
|   +-- ssot.js                 PX-103 - imposer la source de vérité
|   +-- runbook-cache.js        PX-204 - fraîcheur du runbook (bonus)
|
+-- observability/
|   +-- tracing.js              PX-104 - contrat de trace cognitive
|   +-- redaction.js            PX-202 - données sensibles (bonus)
|
+-- governance/
|   +-- action-policy.js        PX-105 - Human Gate
|   +-- tool-permissions.js     PX-205 - moindre privilège (bonus)
|
+-- evals/
|   +-- release-gate.js         PX-106 - protection contre les régressions
|
+-- ai/
|   +-- provider.js             adaptateur modèle distant/gratuit (déjà fonctionnel)
|   +-- model-router.js         PX-203 - routage modèle (bonus)
|   +-- fallback.js             PX-206 - fallback provider (bonus)
|
+-- security/
|   +-- untrusted-input.js      PX-201 - prompt injection (bonus)
|
+-- agents/
|   +-- definitions.js          rôles et frontières existants
|
+-- tests/
|   +-- smoke.test.js           smoke tests du starter
|
+-- output/
    +-- notes/livrables optionnels

private/
+-- missions.json               contenu des missions - NE PAS MODIFIER
+-- hints.json                  indices progressifs - NE PAS MODIFIER
+-- evidence.js                 moteur de replay déterministe - NE PAS MODIFIER
+-- checks.js                   checker - NE PAS MODIFIER
```

## Modèle mental

```text
JOUEUR / ÉVÉNEMENT LIVE
        |
        v
      ROUTER
        |
        +--> PLAYER SUPPORT
        +--> ANTI-CHEAT <--> REVIEWER
        +--> ECONOMY WATCH
        +--> RELEASE GUARD
                         |
                         v
                    ACTION POLICY
                         |
                    HUMAN GATE
                         |
                         v
                      EXECUTOR

Tous les appels -> TRACE EXPLORER
Toutes les releases -> EVAL GATE
```

La leçon importante n'est pas « mettre un LLM partout ». Certaines tâches appartiennent aux agents ; la sécurité, les budgets, les contrats et les autorisations doivent souvent rester **déterministes**.
