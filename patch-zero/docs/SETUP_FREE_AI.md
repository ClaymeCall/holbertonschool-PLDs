# Configuration IA distante optionnelle

PATCH//ZERO démarre en **Fixture Safe Mode** et ne nécessite aucune clé API. Les missions, Replay, Check et `certify` restent entièrement déterministes : **un modèle distant n'est jamais l'arbitre du PLD**.

Le mode LIVE sert dans **ÉQUIPE IA / Agent Lab** pour tester les mêmes rôles avec une vraie génération, comparer le comportement à la fixture et observer provider, modèle, latence et tokens.

## 1. Démarrer sans clé - mode recommandé

```ini
AI_PROVIDER=fixture
```

Puis :

```bash
npm start
```

Si l'interface affiche **FIXTURE SAFE MODE**, tout est normal : l'intégralité du TP reste réalisable.

## 2. Activer un vrai modèle

Copiez `.env.example` en `.env`, choisissez **un provider**, renseignez sa clé puis choisissez explicitement un `AI_MODEL`. Le modèle doit être un modèle texte/chat compatible avec l’endpoint Chat Completions du provider (pas un modèle image, audio ou embeddings).

### OpenAI

```ini
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-5.6-luna
```

### Google Gemini

```ini
AI_PROVIDER=gemini
GEMINI_API_KEY=...
AI_MODEL=gemini-3.6-flash
```

Gemini est appelé via son endpoint officiel compatible OpenAI.

### xAI / Grok

```ini
AI_PROVIDER=xai
XAI_API_KEY=xai-...
AI_MODEL=grok-4.6
```

`AI_PROVIDER=grok` est également accepté comme alias.

### Mistral AI

```ini
AI_PROVIDER=mistral
MISTRAL_API_KEY=...
AI_MODEL=mistral-large-latest
```

### Groq

```ini
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
AI_MODEL=openai/gpt-oss-20b
```

### OpenRouter

```ini
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=openrouter/free
```

OpenRouter est pratique si vous voulez tester plusieurs familles de modèles avec une seule intégration (par exemple OpenAI, Gemini, Grok, Mistral, Claude et d’autres modèles disponibles dans son catalogue).

## 3. Provider compatible OpenAI personnalisé

Pour un autre gateway, un serveur local ou un provider exposant `/v1/chat/completions` :

```ini
AI_PROVIDER=custom
AI_BASE_URL=http://localhost:1234/v1
AI_API_KEY=
AI_MODEL=my-model
```

La clé est facultative en mode `custom`, car certains serveurs locaux n'en demandent pas.

## 4. Le mode fallback

Par défaut :

```ini
AI_FALLBACK_TO_FIXTURE=true
```

Si la clé est invalide, si le provider renvoie `429`, si le réseau tombe ou si la requête dépasse le timeout, **Agent Lab repasse automatiquement sur une fixture**. L'interface indique alors qu'un fallback a eu lieu.

Pour déboguer volontairement une connexion live et laisser remonter l'erreur :

```ini
AI_FALLBACK_TO_FIXTURE=false
```

## 5. Ce qui dépend du modèle... et ce qui n'en dépend jamais

Le modèle LIVE peut servir à :

- interroger PLAYER SUPPORT, ANTI-CHEAT, ECONOMY WATCH ou RELEASE GUARD ;
- comparer les réponses selon le rôle et les frontières ;
- observer le provider, le modèle, la latence et les tokens ;
- expérimenter avec différentes familles de modèles.

Le modèle LIVE **ne décide jamais** :

- si PX-101 à PX-206 est réussi ;
- si un `check` passe ;
- si `certify` valide les CORE ;
- si un rollback est autorisé ;
- si une source est vraie.

Ces décisions restent dans le code déterministe du projet.

## 6. Important

- Ne commitez jamais `.env` ou une clé API.
- Redémarrez `npm start` après un changement de provider/modèle.
- `AI_MODEL` reste libre : le catalogue des fournisseurs évolue plus vite que le starter.
- Une requête distante est interrompue après environ 12 secondes.
- Aucun SDK externe n'est nécessaire : PATCH//ZERO utilise `fetch` et le contrat Chat Completions compatible OpenAI.
- Pour revenir instantanément au mode sûr : `AI_PROVIDER=fixture`.

## Dépannage

Lancez :

```bash
npm run doctor
npm test
```

Puis consultez `docs/TROUBLESHOOTING.md`. Dans l'Agent Lab, regardez toujours le badge et la ligne `provider · model` pour savoir si la réponse vient réellement du modèle choisi ou d'une fixture de secours.
