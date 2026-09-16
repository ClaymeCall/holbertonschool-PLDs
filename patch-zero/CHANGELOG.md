# PATCH//ZERO - Changelog

## 2.3.0 - Multi-provider Live AI

- Fixture Safe Mode reste le mode par défaut, sans clé API.
- Ajout du support live pour OpenAI, Google Gemini, xAI/Grok, Mistral AI, Groq et OpenRouter.
- Ajout d’un provider `custom` pour les endpoints compatibles OpenAI (`AI_BASE_URL`).
- `AI_MODEL` est choisi explicitement par l’étudiant pour éviter de figer le workshop sur un catalogue fournisseur.
- Un moteur Chat Completions commun remplace les branches provider dupliquées.
- Fallback automatique vers les fixtures en cas de clé absente, quota, timeout ou erreur réseau (`AI_FALLBACK_TO_FIXTURE=true`).
- L’Agent Lab signale clairement lorsqu’une réponse est issue d’un fallback.
- Documentation `.env`, setup IA et dépannage mise à jour.
- Tests de contrat ajoutés pour le provider custom et le fallback.

# PATCH//ZERO - V2.2.1 hardening

Cette révision conserve **strictement les mêmes 6 CORE + 6 BONUS** et le même guide étudiant. Elle corrige des problèmes de runtime autour du starter et renforce l'aide intégrée sans révéler les solutions.

## Correctifs V2.2.1

- correction du moteur `private/evidence.js` lorsque le projet est placé dans un chemin contenant des espaces ou des caractères URL-encodés ;
- priorité correcte de `PORT` fourni par le terminal/CI sur la valeur de `.env` ;
- validation des identifiants de mission côté API : une mission inconnue renvoie désormais 404 au lieu d'une 500 ;
- JSON invalide et corps trop volumineux traités proprement par l'API ;
- agent inconnu refusé explicitement au lieu d'être remplacé silencieusement par PLAYER SUPPORT ;
- test de non-régression : les 12 Replay doivent tous produire une preuve sans crash, même si le starter reste volontairement en échec ;
- documentation `docs/TROUBLESHOOTING.md` ajoutée ;
- commentaires pédagogiques renforcés dans les fichiers CORE (rôle, entrée, sortie, pièges) sans donner les solutions ;
- prérequis Node.js 20+ documenté.
- `npm run doctor` vérifie maintenant réellement la version Node et les assets critiques ; il retourne un code d'erreur si un prérequis bloquant manque.

## Correctifs déjà présents depuis V2.2

- fallback Canvas automatique si WebGL / Three.js est indisponible ;
- ÉQUIPE IA lit les permissions réelles depuis `working/governance/tool-permissions.js` ;
- TRACES reflète la correction de PX-102 ;
- suppression de la dépendance Google Fonts ;
- protection du chemin de fichiers statiques ;
- provider IA optionnel normalisé avec timeout ;
- front et guide étudiant audités.

## État attendu du starter

- `npm run doctor` : PASS ;
- `npm test` : PASS ;
- `npm run certify` : **0/6 CORE**, attendu avant le travail étudiant.
