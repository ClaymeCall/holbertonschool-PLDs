# Game Over : Black Friday

Une boutique de jeux vidéo est déjà prête à être utilisée. Le Black Friday approche : votre travail consiste à améliorer son architecture sans refaire son interface.

**Commencez par `CONSIGNES_ETUDIANTS.md` (ou le PDF `ENONCE_ETUDIANTS.pdf`).** Les six missions indiquent le problème à observer, les fichiers concernés, le comportement attendu et les tests. À vous de comprendre la cause et d'écrire la correction.

## Démarrer en 4 étapes

Prérequis : Docker Desktop (ou Docker Engine avec Compose), un terminal et un éditeur de code. Le port **8080** doit être libre. Pas de `npm install`, de `.env` ni de base de données à créer.

1. Décompressez l'archive et ouvrez le dossier `game-over-pld` dans VS Code.
2. Ouvrez le terminal **A**, à la racine du projet, là où se trouve `docker-compose.yml` :

   ```bash
   docker compose up
   ```

3. Laissez ce terminal ouvert. Ouvrez **http://localhost:8080** dans un navigateur.
4. Ouvrez le terminal **B** dans le même dossier pour contrôler le démarrage :

   ```bash
   docker compose exec -T api node private/scripts/smoke.mjs
   docker compose exec -T api node private/scripts/progress.mjs
   ```

**Au départ :** le smoke test doit réussir, mais plusieurs tests de missions doivent échouer. C'est volontaire : ce sont les problèmes que vous allez résoudre. La progression affiche les missions encore à terminer.

## Où travailler ?

```text
game-over-pld/
├── README.md                        Informations de démarrage (lecture)
├── CONSIGNES_ETUDIANTS.md           Énoncé des six missions (lecture)
├── ENONCE_ETUDIANTS.pdf             Le même énoncé illustré (lecture)
├── docker-compose.yml              Configuration Docker (ne pas modifier)
├── private/                         Socle fourni et tests (NE PAS MODIFIER)
│   ├── api/                         Serveur API et source Catalogue simulée
│   ├── inventory/                   Service Stock distinct
│   ├── web/                         Interface React déjà compilée
│   ├── nginx/                       Serveur web
│   ├── tests/                       Tests automatiques des missions
│   └── scripts/                     Progression et contrôles
└── work/                            SEUL DOSSIER À MODIFIER
    ├── api/
    │   ├── catalog.controller.mjs   M1 : réponses HTTP du Catalogue
    │   ├── catalog.service.mjs      M1 : règles de recherche Catalogue
    │   ├── catalog.repository.mjs   À lire seulement : déjà correct
    │   ├── order.domain.mjs         M2 : règles métier Commandes
    │   ├── order.service.mjs        M2 : orchestration des commandes
    │   ├── inventory.client.mjs     M3 : communication avec Stock
    │   └── cache.mjs                M5 : cache et concurrence
    ├── web/view-model.mjs           M4 : affichage du stock
    └── docs/architecture.md        M5 : relevés ; M6 : bilan final
```

Vous avez le droit de **lire** `private/` pour comprendre le fonctionnement, mais **aucune modification** de ce dossier n'est autorisée. N'altérez pas non plus les tests, `docker-compose.yml`, le README ou l'énoncé. Travaillez dans `work/` depuis votre éditeur, même si les volumes sont montés en lecture seule *dans les conteneurs*.

## Commandes à connaître

À lancer dans le terminal **B**, depuis `game-over-pld/` :

| Action | Commande |
| --- | --- |
| Vérifier que les services répondent | `docker compose exec -T api node private/scripts/smoke.mjs` |
| Voir l'état des 6 missions | `docker compose exec -T api node private/scripts/progress.mjs` |
| Tester toutes les missions | `docker compose exec -T api node --test` |
| Tester la mission 1 seulement | `docker compose exec -T api node --test private/tests/01-catalog.test.mjs` |
| Appliquer une modification dans `work/api/` | `docker compose restart api` |
| Appliquer une modification dans `work/web/` | Actualiser la page du navigateur |
| Vérifier le parcours réel après correction | `docker compose exec -T api node private/scripts/e2e.mjs` |
| Contrôler que le socle n'a pas été modifié | `docker compose exec -T api node private/scripts/check-integrity.mjs` |
| Consulter les erreurs API | `docker compose logs -f api` |

Pour tester les missions 2 à 6 individuellement, remplacez `01-catalog.test.mjs` par le fichier indiqué dans chaque mission de l'énoncé.

## Ce qui existe déjà

- La boutique React s'affiche sur le port **8080**, servie par Nginx (`web`).
- Le backend Node (`api`) gère le Catalogue et les Commandes dans **un seul processus**.
- Le service Stock (`inventory`) est un autre processus/conteneur : les échanges passent par HTTP.
- Le Catalogue est une **source de données simulée**, avec 12 jeux et un temps d'accès volontaire. **Il n'y a pas de PostgreSQL**.
- Le Stock est conservé **en mémoire** : « Normal », « Lent » et « HS » permettent de simuler des incidents.
- Dans la boutique, descendez jusqu'à la section **« Chaos & perf »** pour simuler des incidents ou lancer 48 recherches.

## En cas de blocage

- **Le navigateur n'affiche rien :** contrôlez `docker compose ps`, l'état de Docker et l'occupation du port 8080.
- **Vous venez de modifier un fichier `work/api/` :** lancez `docker compose restart api` et regardez les logs.
- **Une erreur de test reste rouge :** lisez le nom du test et la différence entre la valeur attendue et la valeur obtenue. Ne modifiez pas les tests.
- **Le panier affiche une rupture après des essais :** dans « Chaos & perf », cliquez sur **« Réinitialiser stock + incident »**.
- **Vous voulez tout arrêter :** `Ctrl+C` dans le terminal A, puis si nécessaire `docker compose down` dans le terminal B.

**Rendu demandé : le dossier `work/` complété, y compris `work/docs/architecture.md`.** Aucun rapport PDF à produire, aucun changement dans `private/`.
