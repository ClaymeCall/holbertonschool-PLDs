# INCIDENT LOG - Holbies Festival

Pour chaque incident, documentez **avant** de célébrer le CLEARED :

## FC-101 - Double réservation de scène

**Symptôme observé :**
Il était possible de réserver la même scène pour deux spectacles avec des horaires qui se chevauchent.

**Cause racine :**
La fonction `scheduleShow` dans `scheduleService.js` ne vérifiait pas les conflits d'horaire pour une même scène avant d'ajouter un nouveau spectacle.

**Correction appliquée :**
Ajout d'une vérification dans `scheduleShow` (ligne 21-24) utilisant la fonction `overlaps` pour détecter les chevauchements d'horaire sur la même scène. Si un conflit est détecté, la fonction retourne `{ ok: false, code: 'STAGE_CONFLICT', message: 'Stage déjà réservé à cet horaire.' }`.

**Pourquoi cette correction respecte la documentation de référence :**
La logique métier (`04_schedule_sequence.mmd:11`) exige qu'une scène ne puisse pas être réservée simultanément pour deux spectacles. Cette correction implémente cette règle en utilisant la fonction `overlaps` existante pour valider les créneaux horaires.

**Commande de validation :**
```bash
npm run check -- FC-101
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-101


✓ FC-101 — Collision de scène
  INCIDENT CLEARED
```

---

## FC-102 - Artiste ubiquitaire

**Symptôme observé :**
Il était possible de programmer le même artiste sur deux scènes différentes à des horaires qui se chevauchent.

**Cause racine :**
La fonction `scheduleShow` dans `scheduleService.js` ne vérifiait pas les conflits d'horaire pour un même artiste avant d'ajouter un nouveau spectacle.

**Correction appliquée :**
Ajout d'une vérification dans `scheduleShow` (ligne 27-30) utilisant la fonction `overlaps` pour détecter les chevauchements d'horaire pour le même artiste. Si un conflit est détecté, la fonction retourne `{ ok: false, code: 'ARTIST_CONFLICT', message: 'Artiste déjà programmé à cet horaire.' }`.

**Pourquoi cette correction respecte la documentation de référence :**
La logique métier (`04_schedule_sequence.mmd:12`) exige qu'un artiste ne puisse pas être programmé simultanément sur deux scènes différentes. Cette correction implémente cette règle en utilisant la fonction `overlaps` existante pour valider les créneaux horaires.

**Commande de validation :**
```bash
npm run check -- FC-102
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-102


✓ FC-102 — Artiste ubiquitaire
  INCIDENT CLEARED

  ACTE 2 DÉVERROUILLÉ — LES PORTES S’ENTROUVRENT
```

---


## FC-103 - Bracelet fantôme

**Symptôme observé :**
Il était possible d'accorder l'accès à une zone (ex: VIP Deck) en utilisant un bracelet lié à un billet non ACTIVE (ex: CANCELLED), contournant ainsi la validation de l'état du billet.

**Cause racine :**
La fonction `checkAccess` dans `accessService.js` ne vérifiait pas l'état (`status`) du billet associé au bracelet. Elle se contentait de vérifier l'existence du billet sans s'assurer qu'il était ACTIVE.

**Correction appliquée :**
Ajout d'une vérification dans `checkAccess` (ligne 10) pour rejeter l'accès si `ticket.status !== 'ACTIVE'`, retournant `{ allowed:false, code:'TICKET_INACTIVE' }`.

**Pourquoi cette correction respecte la documentation de référence :**
Le diagramme d'état (`03_access_sequence.mmd:12`) montre que seul l'état ACTIVE est valide pour un accès. La séquence d'accès (`03_access_sequence.mmd:12`) exige explicitement de vérifier que le billet est actif.

**Commande de validation :**
```bash
npm run check -- FC-103
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-103


✓ FC-103 — Bracelet fantôme
  INCIDENT CLEARED
```

---

## FC-104 - Backstage breach

**Symptôme observé :**
Accès non autorisé à la zone backstage.

**Cause racine :**
La fonction `checkAccess` dans `accessService.js` ne vérifiait pas correctement les droits d'accès pour la zone backstage.

**Correction appliquée :**
Vérification renforcée des droits d'accès pour la zone backstage.

**Pourquoi cette correction respecte la documentation de référence :**
La séquence d'accès (`working/docs/diagrams/03_access_sequence.mmd:12`) exige de vérifier le billet actif et sa validité.

**Commande de validation :**
```bash
npm run check -- FC-104
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-104


✓ FC-104 — Backstage breach
  INCIDENT CLEARED

  ACTE 3 DÉVERROUILLÉ — LA FOULE MONTE 
```

---

## FC-105 - Scène morte : Transition non autorisée de EVACUATED vers LIVE

**Symptôme observé :**
La machine d'état du `stageService.js` semble autoriser une transition directe de `EVACUATED` vers `LIVE` dans le FIELD LAB, ce qui contourne le processus opérationnel de sécurité. Selon le diagramme de référence (`05_stage_state.mmd`), cette transition n'est pas valide.

**Cause racine :**
Dans le code de démonstration, la transition `EVACUATED -> LIVE` était probablement tentée manuellement via le FIELD LAB. Cependant, le code source (`stageService.js:6`) définit correctement `TRANSITIONS.EVACUATED = ['READY']`, ce qui signifie que la transition vers `LIVE` est déjà bloquée par la logique métier. Le problème vient d'une incompréhension : la FSM interdit explicitement cette transition, et le code l'implémente correctement.

**Correction appliquée :**
Aucune modification du code n'est nécessaire. Le code existant dans `stageService.js` respecte déjà la FSM fournie. La transition `EVACUATED -> LIVE` est rejetée par la validation `allowed.includes(nextStatus)` (ligne 13), qui retourne `{ ok: false, code: 'INVALID_TRANSITION', from: 'EVACUATED', to: 'LIVE' }`.

**Pourquoi cette correction respecte la documentation de référence :**
Le diagramme Mermaid (`05_stage_state.mmd:12`) spécifie que la seule transition autorisée depuis `EVACUATED` est vers `READY` via l'action `safety_clear`. Le code implémente cette règle en limitant `TRANSITIONS.EVACUATED` à `['READY']`, ce qui empêche toute transition directe vers `LIVE`.

**Commande de validation :**
```bash
npm run check -- FC-105
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-105


✓ FC-105 — Scène morte
  INCIDENT CLEARED
```

---

## FC-106 - Une personne de trop

**Symptôme observé :**
Il était possible d'accorder l'accès à une zone même lorsque son occupation était déjà égale à sa capacité maximale, permettant ainsi à une personne supplémentaire d'entrer.

**Cause racine :**
La fonction `checkAccess` dans `accessService.js` utilisait une comparaison `>` (ligne 17) pour vérifier si `zone.occupancy` dépassait `zone.capacity`, ce qui permettait à une personne de plus d'entrer lorsque `occupancy == capacity`.

**Correction appliquée :**
Changement de la condition en `zone.occupancy >= zone.capacity` (ligne 17) pour bloquer l'accès dès que l'occupation atteint ou dépasse la capacité.

**Pourquoi cette correction respecte la documentation de référence :**
Le modèle de données (`01_data_model.mmd:48-49`) définit `capacity` et `occupancy` pour la zone. La logique métier exige que l'accès soit refusé lorsque l'occupation atteint la capacité maximale, ce qui est maintenant implémenté.

**Commande de validation :**
```bash
npm run check -- FC-106
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-106


✓ FC-106 — Une personne de trop
  INCIDENT CLEARED

  ACTE 4 DÉVERROUILLÉ — LE SYSTÈME MENT
```

---

## FC-107 - Payload sauvage

**Symptôme observé :**
Le système acceptait des payloads pour les bracelets (`WristbandPayload`) avec :
- des formats d'`id` et `ticketId` non conformes aux motifs définis dans le contrat API,
- des champs supplémentaires non autorisés,
- des valeurs non valides pour le champ `level`.

**Cause racine :**
La fonction `validateWristbandPayload` dans `accessService.js` ne validait pas :
- les motifs des champs `id` et `ticketId` selon les expressions régulières définies dans `api-contract.yaml` (lignes 56-57),
- la présence exclusive des champs autorisés (`id`, `ticketId`, `level`),
- les valeurs autorisées pour `level` (`STANDARD`, `VIP`, `CREW`, `ARTIST`).

**Correction appliquée :**
Ajout de validations complètes dans `validateWristbandPayload` (lignes 42-58) :
- Vérification des champs autorisés (ligne 46-48),
- Validation de `id` avec `^WB-[0-9]{3,}$` (ligne 51-52),
- Validation de `ticketId` avec `^TK-[0-9]{3,}$` (ligne 55-56),
- Validation de `level` contre les valeurs autorisées (ligne 59-60).

**Pourquoi cette correction respecte la documentation de référence :**
Le schéma `WristbandPayload` dans `api-contract.yaml` (lignes 51-60) définit :
- les champs requis et `additionalProperties: false` (ligne 54),
- les motifs pour `id` et `ticketId` (lignes 56-57),
- les valeurs possibles pour `level` (lignes 58-60).

**Commande de validation :**
```bash
npm run check -- FC-107
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-107


✓ FC-107 — Payload sauvage
  INCIDENT CLEARED
```

---

## FC-108 - Incohérence entre le code HTTP et le corps JSON

**Symptôme observé :**
Le corps JSON pouvait décrire correctement un échec (ex: conflit métier) alors que le code HTTP retourné était inapproprié (ex: 201 pour une création échouée ou 400 pour un conflit métier). Cela empêchait les clients de comprendre la catégorie du résultat sans interpréter le texte du JSON.

**Cause racine :**
Dans `server.js`, les endpoints ne respectaient pas la sémantique REST pour les codes HTTP. Par exemple, une création échouée due à un conflit métier retournait un code 400 au lieu de 409, et une requête invalide pouvait retourner un code 201.

**Correction appliquée :**
Modification des codes HTTP dans `server.js` (lignes 299-302) pour :
- Retourner **201** pour une création réussie,
- Retourner **400** pour une requête invalide (ex: `INVALID_JSON` ou `validateShowShape` échoue),
- Retourner **409** pour un conflit métier (ex: `scheduleShow` échoue).

**Pourquoi cette correction respecte la documentation de référence :**
La sémantique REST standard exige que les codes HTTP reflètent la nature de l'opération : 201 pour une création, 400 pour une requête invalide, et 409 pour un conflit métier. Cette correction aligne le système sur ces standards.

**Commande de validation :**
```bash
npm run check -- FC-108
```

**Résultat :**
```bash
> holbies-festival-control@1.3.0 check
> node private/checker.js check FC-108

✓ FC-108 — Incohérence entre le code HTTP et le corps JSON
  INCIDENT CLEARED
```

---
