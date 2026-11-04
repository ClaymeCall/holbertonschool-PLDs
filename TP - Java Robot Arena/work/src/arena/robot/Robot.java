package arena.robot;

/**
 * Classe de base de tout combattant homologué.
 *
 * BUGS INTENTIONNELS (à corriger au fil des missions) :
 * - Mission 1 : energy est static → partagée entre tous les robots
 * - Mission 1 : equals compare mal les noms (opérateur ==)
 * - Mission 2 : takeDamage / repair / getters ne protègent pas les invariants
 * - Mission 5 : certaines actions devraient lever des exceptions métier
 */
public abstract class Robot {

    // id / name : volontairement non-final au départ pour que le bug this compile
    // (sinon javac refuse le constructeur). Vous pouvez les repasser en final après correction.
    private String id;
    private String name;
    private final int maxHealth;
    private final int attackPower;

    protected int energy;

    protected int health;
    protected boolean destroyed;

    public Robot(String id, String name, int maxHealth, int attackPower, int energy) {
        // BUG Mission 1 : this manquant / initialisation incomplète
        this.id = id;
        this.name = name;
        this.maxHealth = maxHealth;
        this.attackPower = attackPower;
        this.health = maxHealth;
        this.energy = energy;
        this.destroyed = false;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getMaxHealth() {
        return maxHealth;
    }

    public int getAttackPower() {
        return attackPower;
    }

    public int getHealth() {
        return health;
    }

    public int getEnergy() {
        return energy;
    }

    public boolean isDestroyed() {
        return destroyed;
    }

    public boolean isAlive() {
        return !destroyed && health > 0;
    }

    /**
     * Attaque de base. Coûte 20 d'énergie.
     * Retourne les dégâts infligés (avant mitigation cible).
     */
    public int attack(Robot target) {
        // BUG Mission 2/5 : pas de garde si détruit / énergie insuffisante / cible nulle
        energy -= 20;
        return attackPower;
    }

    /**
     * Applique des dégâts reçus.
     */
    public void takeDamage(int amount) {
        // BUG Mission 2 : n'empêche pas les dégâts négatifs ni le dépassement
        health -= amount;
        if (health <= 0) {
            destroyed = true;
        }
    }

    /**
     * Répare le robot.
     */
    public void repair(int amount) {
        // BUG Mission 2 : pas de plafond maxHealth, pas de refus si détruit
        health += amount;
    }

    /**
     * Capacité spéciale : redéfinie par chaque sous-classe.
     */
    public abstract SpecialResult useSpecial(Robot target);

    /** true si la capacité privilégie un allié (soin). */
    public boolean isSupportSpecial() {
        return false;
    }

    public void spendEnergy(int cost) {
        energy -= cost;
    }

    public void restoreEnergy(int amount) {
        energy += amount;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof Robot other)) {
            return false;
        }
        // BUG Mission 1 : == compare les références, pas le contenu
        return name.equals(other.name);
    }

    @Override
    public int hashCode() {
        return name == null ? 0 : name.hashCode();
    }

    @Override
    public String toString() {
        return name + " [" + id + "] HP=" + health + "/" + maxHealth + " EN=" + energy
                + (destroyed ? " DESTROYED" : "");
    }

    /** Résultat d'une capacité spéciale. */
    public record SpecialResult(String label, int damageDealt, int healingDone, int energySpent) {
    }
}
