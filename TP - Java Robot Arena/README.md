# Robot Arena : Centre technique Saison 2147

Plateforme immersive de préparation et de supervision de combats de robots.
Vous réparez le simulateur Java, puis vous homologuez votre propre combattant.

## Démarrage

```bash
docker compose up --build
```

Ouvrez ensuite : **http://localhost:8080**

Aucune installation locale de Java n’est nécessaire. Docker fournit le JDK 21.

## Organisation

| Dossier | Rôle | Consigne |
|---------|------|----------|
| `work/` | Classes Java à réparer / compléter, notes, scénarios | **Votre atelier** |
| `private/` | Interface, serveur, tests de validation, moteur d’affichage | **Ne pas modifier** |
| `compose.yaml` | Lancement de la plateforme | (rien) |

## Parcours

1. Prendre son poste (mission 0)
2. Réparer le moteur (missions 1 → 5)
3. Créer son challenger (mission 6)
4. Tournoi & restitution

## Contraintes

- Java 21
- Compilation via `javac` (aucun Maven / Gradle côté étudiant)
- Aucune bibliothèque externe
- Signatures publiques des classes fournies à conserver

## Aide

Toute la documentation utile est dans la plateforme (onglet Documentation)
et dans `work/docs/`. Les indices progressifs sont dans chaque fiche de mission.
