# PATCH//ZERO - Dépannage étudiant

Ce document sert à distinguer un **incident volontaire du PLD** d'un **problème technique du starter**.

## 1. Le `certify` affiche 0/6

C'est normal au début :

```text
CORE 0/6 NOT READY
```

Les six missions CORE sont volontairement en échec dans le starter. Utilisez **Replay**, corrigez uniquement le fichier indiqué, puis relancez le **Check**.

## 2. Vérifier l'environnement

```bash
node -v
npm run doctor
npm test
```

Le projet cible **Node.js 20+** et ne nécessite pas `npm install`. Si `npm test` échoue avant toute modification, recopiez l'erreur complète avant de commencer une mission.

## 3. Le port 4177 est déjà utilisé

Lancez temporairement le serveur sur un autre port :

```bash
PORT=4180 npm start
```

Puis ouvrez `http://localhost:4180`. Une variable `PORT` définie dans le terminal est prioritaire sur la valeur éventuellement présente dans `.env`.

## 4. J'ai une erreur de syntaxe dans `working/`

Le Mission Control est conçu pour rester accessible même si un fichier étudiant est temporairement invalide. Le Replay/Check de la mission concernée doit afficher l'erreur.

Pour isoler rapidement le fichier :

```bash
node --check working/chemin/du-fichier.js
```

Corrigez d'abord la syntaxe, puis relancez le Replay.

## 5. Replay / Check / Evidence

Exemples :

```bash
npm run evidence -- PX-101
npm run check -- PX-101
npm run certify
```

`evidence` montre le comportement observé. `check` compare ce comportement au contrat de la mission. `certify` contrôle les six CORE.

Le projet fonctionne aussi lorsqu'il est placé dans un dossier contenant des espaces (par exemple `Mes projets/PATCH ZERO`).

## 6. L'IA distante ne répond pas

Aucun provider externe n'est requis. Revenez au mode sûr :

```ini
AI_PROVIDER=fixture
```

Puis redémarrez `npm start`. Pour OpenAI, Gemini, xAI/Grok, Mistral, Groq, OpenRouter ou un endpoint compatible OpenAI, consultez `docs/SETUP_FREE_AI.md`.

Si vous avez choisi un provider live mais voyez encore **FIXTURE**, vérifiez trois choses : `AI_PROVIDER`, la clé correspondante et `AI_MODEL`. L’Agent Lab affiche aussi un message **FALLBACK** lorsqu’un appel live échoue et que le mode sûr prend le relais.

## 7. Je ne sais plus où coder

Ne parcourez pas tout le dépôt au hasard. Dans **INCIDENTS**, regardez **COMMENCEZ ICI**, puis ouvrez le fichier indiqué. La carte générale est dans :

```text
working/PROJECT_MAP.md
```

Les commentaires en tête des fichiers expliquent leur rôle, leurs entrées/sorties et ce qu'il faut observer. Ils ne donnent volontairement pas la correction.

## 8. Ce qu'il ne faut pas modifier

Travaillez dans `working/`. Ne modifiez pas `private/` pour faire passer une mission : `private/` contient les scénarios, preuves et checkers, c'est-à-dire l'arbitre du PLD.
