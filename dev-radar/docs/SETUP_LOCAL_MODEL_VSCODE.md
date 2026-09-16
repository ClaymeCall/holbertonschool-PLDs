# DEV RADAR - Setup du modèle local et de VS Code

Cette étape se fait **avant de commencer les exercices**. L'objectif est que chaque membre du groupe sache lancer un petit LLM local et l'utiliser depuis VS Code sans API IA payante.

## 1. Installer Ollama

Installez Ollama sur votre machine depuis le site officiel, puis ouvrez un nouveau terminal.

Vérifiez l'installation :

```bash
ollama --version
```

Si Ollama n'est pas déjà lancé par l'application système, démarrez le serveur :

```bash
ollama serve
```

Ollama écoute par défaut sur `http://127.0.0.1:11434`.

> Le téléchargement initial d'Ollama et du modèle nécessite Internet. Les inférences réalisées ensuite par DEV RADAR utilisent le modèle local.

## 2. Installer le modèle de référence

Tous les groupes commencent avec le même modèle afin de garder des conditions comparables :

```bash
ollama pull qwen2.5-coder:3b
```

Vérifiez qu'il est bien présent :

```bash
ollama list
```

Puis faites un premier test direct :

```bash
ollama run qwen2.5-coder:3b
```

Dans le prompt, demandez :

```text
Réponds uniquement : DEV RADAR LOCAL OK
```

Quittez ensuite la session interactive.

## 3. Connecter Ollama à VS Code

1. Vérifiez que VS Code est à jour. L'extension officielle Ollama actuelle nécessite VS Code 1.127 ou plus récent.
2. Ouvrez **Extensions** (`Ctrl/Cmd + Shift + X`).
3. Recherchez **Ollama** et installez l'extension officielle publiée par **Ollama** (`Ollama.ollama`).
4. Vérifiez qu'Ollama tourne toujours localement.
5. Ouvrez le panneau **Chat** de VS Code.
6. Ouvrez le sélecteur de modèle en bas de la zone de chat.
7. Dans la section **Ollama**, sélectionnez `qwen2.5-coder:3b`.
8. Envoyez :

```text
Réponds uniquement : DEV RADAR LOCAL OK
```

À ce stade, votre poste doit être capable d'utiliser le modèle depuis VS Code.

### Si le modèle n'apparaît pas

Dans la palette de commandes (`Ctrl/Cmd + Shift + P`) :

- lancez `Ollama: Refresh Models` ;
- puis, si nécessaire, `Ollama: Diagnose Models` ;
- vérifiez aussi `ollama list` dans le terminal.

## 4. Ouvrir DEV RADAR dans VS Code

Décompressez le projet puis ouvrez **le dossier racine DEV RADAR**, celui qui contient `package.json`.

Dans le terminal intégré de VS Code :

```bash
npm install
npm run doctor
```

Le doctor vérifie :

- Node.js 20+ ;
- la disponibilité d'Ollama ;
- la présence de `qwen2.5-coder:3b` ;
- et, lorsque la commande `code` est disponible dans le terminal, la version de VS Code et l'extension Ollama.

Testez ensuite un appel réel depuis le projet :

```bash
npm run local:check
```

Puis lancez DEV RADAR :

```bash
npm start
```

Ouvrez `http://localhost:4188`.

Pour rejouer le pipeline en incluant le modèle local :

```bash
npm run radar -- --local
```

## 5. Gate 0 - avant de continuer

Votre groupe ne passe au Business Brief que lorsque :

- `ollama list` affiche `qwen2.5-coder:3b` ;
- le modèle répond dans VS Code ;
- `npm run doctor` ne signale pas de blocage Node/Ollama/modèle ;
- `npm run local:check` renvoie une réponse locale ;
- `npm start` lance l'interface.

## Docker ?

**Pas pour cette première étape.** Ollama reste sur la machine hôte. Dockeriser le modèle introduirait des problèmes de GPU, réseau et volumes qui ne sont pas l'objectif de ce PLD. Le groupe pourra proposer une dockerisation du reste de l'application plus tard, s'il peut justifier son intérêt.


## Avant de construire les agents : observer les sources

Une fois le Gate 0 validé et l'application démarrée, exécutez :

```bash
npm run source:preview
```

Cette commande affiche quelques signaux bruts (titre, source, date, URL, autorité, catégorie). Aucun agent et aucun LLM n'intervient. Le but est de comprendre ce que SCOUT recevra avant de définir sa responsabilité.
