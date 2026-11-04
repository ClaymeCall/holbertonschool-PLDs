# Plan du projet : Robot Arena

## Carte des dossiers

```
work/
├── docs/                 ← vous êtes ici
├── notes/                ← journal de bord binôme
├── scenarios/            ← scénarios de repro manuels
└── src/arena/
    ├── robot/            ← Robot, Tank, Sniper, Medic, Challenger
    ├── team/             ← Team (registre)
    ├── combat/           ← CombatEngine, événements, classement
    └── exception/        ← exceptions métier
```

`private/` contient la plateforme web, les tests de validation et le guide formateur.
**Ne modifiez jamais `private/`.**

## Ordre recommandé

| # | Mission | Fichiers principaux |
|---|---------|---------------------|
| 0 | Prendre son poste | lecture seule |
| 1 | Réinitialisation impossible | `Robot.java` |
| 2 | Robots hors limites | `Robot.java` |
| 3 | Capacités en panne | `Tank.java`, `Sniper.java`, `Medic.java` |
| 4 | Registre corrompu | `Team.java` |
| 5 | Combat interrompu | `Robot.java`, `CombatEngine.java` |
| 6 | Nouveau challenger | `Challenger.java` (+ évent. nouvelle capacité) |

## Boucle de travail

1. Lire le ticket de mission dans la plateforme
2. Reproduire le symptôme (banc de tests ou arène)
3. Corriger le code dans `work/src`
4. Compiler & tester depuis la plateforme
5. Observer l’effet dans l’arène / le journal

## Notions Java revisitées

`equals` · `this` · `static` · encapsulation · héritage · classe abstraite ·
polymorphisme · interface · collections · copie défensive · exceptions
