# Zone de travail

Tout votre travail se fait ici.

- `agents/` : identite et frontieres de SCOUT, ANALYST et EDITOR.
- `context/` : contexte metier de l'entreprise et politiques.
- `memory/` : memoire externe du projet.
- `skills/` : standards reutilisables de l'entreprise.
- `schemas/` : contrats structures entre les agents.
- `src/` : pipeline, orchestration, contexte, securite, cache et modele local.
- `mcp/` : serveur MCP read-only qui expose les sources de veille.
- `output/` : briefs et traces generees.

Les commandes npm se lancent depuis la racine du projet, pas depuis `working/`.

Avant de commencer les exercices, suivez `docs/SETUP_LOCAL_MODEL_VSCODE.md` depuis la racine du projet et validez `npm run doctor` puis `npm run local:check`.
