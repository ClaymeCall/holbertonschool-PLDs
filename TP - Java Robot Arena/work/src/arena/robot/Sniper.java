package arena.robot;

/**
 * Robot de précision : attaque de base renforcée, capacité "Tir critique".
 *
 * Budget de référence : HP 90, ATK 28, EN 100
 *
 * À compléter : Mission 3.
 */
public class Sniper extends Robot {

    private static final int SPECIAL_COST = 35;
    private static final double CRIT_MULTIPLIER = 2.0;

    public Sniper(String id, String name) {
        super(id, name, 90, 28, 100);
    }

    @Override
    public int attack(Robot target) {
        // BUG Mission 3 : devrait infliger attackPower (pas attaque générique incorrecte)
        // Le coût énergie reste 20 via la logique de base une fois corrigée.
        return this.getAttackPower();
    }

    @Override
    public SpecialResult useSpecial(Robot target) {
        // BUG Mission 3 : non implémenté
        // Attendu : coûte SPECIAL_COST, dégâts = (int)(getAttackPower() * CRIT_MULTIPLIER)
        int specialDamage = (int)(getAttackPower() * CRIT_MULTIPLIER);
        target.takeDamage(specialDamage);
        this.energy -= SPECIAL_COST;
        return new SpecialResult("Tir critique", specialDamage, 0, SPECIAL_COST);
    }
}
