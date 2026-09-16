# DEV RADAR - Three agents. Zero cloud. Zero budget.

PLD Agentic en groupe de 3. Mission CORE cible : 3 heures.

## Démarrage
```bash
ollama pull qwen2.5-coder:3b
npm install
npm run doctor
npm run local:check
npm start
```
Puis ouvrez http://localhost:4188.

Avant de créer les agents, observez la matière brute :
```bash
npm run source:preview
```
Aucun agent ni LLM n'intervient dans cette commande.

## Foundation
Complétez `working/agents/*.md`, puis validez progressivement :
```bash
npm run check:scout
npm run check:analyst
npm run check:editor
npm run check:pipeline
npm run foundation
```

## Premier run
```bash
npm run radar
npm run radar -- --local
```

## Incident Day
Les 6 CORE sont : RAD-101, RAD-102, RAD-104, RAD-106, RAD-111, RAD-115.
```bash
npm run incident -- RAD-101
npm run hint -- RAD-101 1
npm run check -- RAD-101
```
Après 6/6 :
```bash
npm run certify
```
Les 9 bonus se déverrouillent alors.

## Démo live
```bash
npm run radar:live
```
Le mode live tente quelques GitHub Releases publiques, puis revient sur les fixtures locales si le réseau est indisponible. Aucun LLM cloud n'est utilisé.

## Règle
Travaillez dans `working/`. Ne modifiez pas `private/`.
