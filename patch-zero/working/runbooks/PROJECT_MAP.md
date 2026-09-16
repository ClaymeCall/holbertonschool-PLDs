# PATCH//ZERO - Project Map

You do not need to explore the whole repository before starting. Each mission names the exact starting file.

```text
working/
|
+-- context/
|   +-- context-router.js       PX-101 - isolate player context
|
+-- orchestration/
|   +-- review-loop.js          PX-102 - stop runaway agent loops
|
+-- knowledge/
|   +-- ssot.js                 PX-103 - enforce source of truth
|   +-- runbook-cache.js        PX-204 - freshness bonus
|
+-- observability/
|   +-- tracing.js              PX-104 - cognitive trace contract
|   +-- redaction.js            PX-202 - sensitive telemetry bonus
|
+-- governance/
|   +-- action-policy.js        PX-105 - Human Gate
|   +-- tool-permissions.js     PX-205 - least privilege bonus
|
+-- evals/
|   +-- release-gate.js         PX-106 - regression protection
|
+-- ai/
|   +-- provider.js             remote/free model adapter (already working)
|   +-- model-router.js         PX-203 - model routing bonus
|   +-- fallback.js             PX-206 - provider fallback bonus
|
+-- security/
|   +-- untrusted-input.js      PX-201 - prompt injection bonus
|
+-- agents/
|   +-- definitions.js          existing roles and boundaries - read only unless curious
|
+-- tests/
|   +-- smoke.test.js           starter smoke tests
|
+-- runbooks/
|   +-- PROJECT_MAP.md          this map
|
+-- output/
    +-- optional notes/artifacts

private/
+-- missions.json               mission content - DO NOT MODIFY
+-- hints.json                  progressive hints - DO NOT MODIFY
+-- evidence.js                 deterministic replay engine - DO NOT MODIFY
+-- checks.js                   checker - DO NOT MODIFY
```

## Mental model

```text
PLAYER / GAME EVENT
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

All calls -> TRACE EXPLORER
All releases -> EVAL GATE
```

The important lesson is not "LLM everywhere". Some decisions belong to agents; safety, budgets, contracts and authorizations should often stay deterministic.
