# Notions Java utiles : Robot Arena

## Instance vs classe (`static`)

Un champ `static` appartient à la **classe** : toutes les instances partagent la même valeur.
Un champ d’instance appartient à **chaque objet**.

```java
protected int energy;          // OK : une énergie par robot
protected static int energy;   // BUG : une seule énergie pour tous
```

## `this` dans le constructeur

```java
public Robot(String id, ...) {
    this.id = id;   // champ = paramètre
    // id = id;     // ne fait rien d'utile
}
```

## `equals` sur les chaînes

`==` compare les références. `equals` compare le contenu.

```java
return Objects.equals(name, other.name);
// ou : name != null && name.equals(other.name);
```

## Encapsulation

Les invariants (`0 <= health <= maxHealth`, `destroyed`) se protègent dans les méthodes
mutatrices (`takeDamage`, `repair`), pas en laissant les champs publics.

## Héritage & polymorphisme

`CombatEngine` manipule des `Robot`. Au runtime, `useSpecial` exécute le code de
`Tank`, `Sniper`, `Medic` ou `Challenger` : sans `instanceof` dans le moteur.

## Copie défensive

```java
public List<Robot> getRobots() {
    return List.copyOf(robots); // ou new ArrayList<>(robots)
}
```

## Exceptions métier

Une action impossible (détruit, sans énergie) lève une `ArenaException` prévue.
Le moteur la journalise et continue, au lieu de planter.
