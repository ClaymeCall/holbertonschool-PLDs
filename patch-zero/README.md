# PATCH//ZERO - Eclipse Realms LiveOps

**Version 2.3.0 - multi-provider Live AI + hardening runtime - PLD Agentic Ops - 3h - 6 CORE + 6 BONUS**

La Saison 7 est en ligne. **248 319 joueurs** sont connectés. Eclipse Realms utilise déjà des agents IA pour le support, l'anti-cheat, la surveillance de l'économie et les opérations de release.

Votre rôle n'est pas de reconstruire une nouvelle équipe d'agents. Vous prenez la garde en tant que **Lead LiveOps** : observer un incident, le rejouer, ouvrir le fichier exact indiqué, corriger une frontière de production puis prouver que le comportement a changé.

## Prérequis

- **Node.js 20 ou plus récent** (`node -v`) ;
- aucun package npm à installer ;
- un navigateur récent.

## Démarrage

```bash
npm run doctor
npm start
```

Ouvrez ensuite **http://localhost:4177**.

Il n'y a **aucun `npm install` à faire**. React et Three.js sont fournis localement dans le starter. Le front ne dépend d'aucun CDN pour fonctionner.

> **Important :** `npm run certify` affiche volontairement `CORE 0/6 NOT READY` au début. Ce n'est pas une panne : les six incidents CORE constituent précisément le travail à corriger.

## Votre boucle de travail

1. Ouvrez **INCIDENTS**.
2. Lisez le scénario et l'impact avant de coder.
3. Cliquez sur **REJOUER L'INCIDENT**.
4. Ouvrez uniquement le fichier affiché dans **COMMENCEZ ICI**.
5. Lisez le commentaire en tête du fichier pour comprendre sa place dans le flux.
6. Faites une correction ciblée.
7. Relancez le Replay.
8. Lancez **LANCER LE CONTRÔLE** quand le comportement observable est correct.
9. Utilisez les indices 1 -> 2 -> 3 uniquement si nécessaire.

Vous ne devez pas passer la séance à chercher dans le repository : chaque mission indique le point de départ exact.

## Les espaces de la plateforme

- **CENTRE LIVEOPS** : état global, shards, budget et flux opérationnel.
- **INCIDENTS** : scénario, Replay, fichier de départ, comportement attendu, Check et indices.
- **TRACES** : spans, latence, tokens et décisions agentiques.
- **ÉQUIPE IA** : rôles, frontières et permissions réellement exposées par le code étudiant.
- **VALIDATION HUMAINE** : Human Gate des actions à fort impact.
- **INFRASTRUCTURE** : flux de décision, zones du projet et frontières de confiance.

Les écrans se mettent à jour à partir du code de `working/` après un Check. Par exemple, une boucle corrigée n'apparaît plus comme active dans TRACES, et les permissions corrigées sont reflétées dans ÉQUIPE IA.

## Modèle IA : distant et optionnel

PATCH//ZERO fonctionne entièrement en **Fixture Safe Mode**. Les missions et les checkers ne dépendent d'aucun modèle payant ni d'aucune API externe.

L'écran **ÉQUIPE IA** peut, en option, tester les rôles avec **OpenAI, Gemini, xAI/Grok, Mistral, Groq, OpenRouter** ou un endpoint compatible OpenAI personnalisé. Voir `docs/SETUP_FREE_AI.md`.

Une requête distante est limitée dans le temps. Par défaut, si le provider est indisponible, rate-limité ou mal configuré, l’Agent Lab **retombe automatiquement sur la fixture** et l’indique dans la réponse. Le PLD reste donc entièrement réalisable.

## Commandes utiles

```bash
npm start
npm test
npm run doctor
npm run evidence -- PX-101
npm run check -- PX-101
npm run certify
```

## Zone étudiante

Modifiez uniquement **`working/`**.

`private/` contient le moteur des missions, les preuves et les checkers. Le modifier reviendrait à changer l'arbitre au lieu de réparer le système.

La carte du code est disponible dans `working/PROJECT_MAP.md`. Les fichiers de départ contiennent des commentaires de contexte (entrée, sortie, rôle dans le flux, pièges à éviter) sans donner la solution.

En cas de souci de lancement, de port, de syntaxe ou de provider IA, consultez `docs/TROUBLESHOOTING.md`.

## Guide étudiant

Le guide à distribuer se trouve ici :

`docs/PATCH_ZERO_Guide_Etudiant.pdf`

Il contient le scénario complet, le fonctionnement de la plateforme, les six CORE, les BONUS et les captures correspondant à cette interface LiveOps.
