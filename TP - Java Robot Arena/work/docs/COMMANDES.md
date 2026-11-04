# Commandes utiles

## Plateforme (recommandé)

```bash
docker compose up --build
```

Puis http://localhost:8080 → bouton **Compiler et tester**.

## Compilation manuelle (dans le conteneur)

```bash
docker compose exec robot-arena bash -lc '
  mkdir -p /tmp/arena-build &&
  find /arena/work/src /arena/private/tests /arena/private/engine -name "*.java" > /tmp/sources.txt &&
  javac --release 21 -d /tmp/arena-build @/tmp/sources.txt
'
```

## Notes

- JDK 21 uniquement
- Pas de dépendance Maven / Gradle côté étudiant
- Les erreurs de compilation affichent fichier + ligne dans la plateforme
