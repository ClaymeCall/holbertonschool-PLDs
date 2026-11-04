package arena.robot;

/**
 * Robot cuirassé : absorbe une partie des dégâts, capacité "Bouclier d'impact".
 *
 * Budget de référence : HP 140, ATK 18, EN 100
 *
 * À compléter : Mission 3.
 */
public class Tank extends Robot {

    private static final int SHIELD_ABSORB = 8;
    private static final int SPECIAL_COST = 30;
    private static final int SPECIAL_DAMAGE = 25;

    public Tank(String id, String name) {
        super(id, name, 140, 18, 100);
    }

    @Override
    public void takeDamage(int amount) {

        // Comportement attendu : dégâts reçus = max(0, amount - SHIELD_ABSORB)
        super.takeDamage(amount - SHIELD_ABSORB);
    }

    @Override
    public SpecialResult useSpecial(Robot target) {
        // BUG Mission 3 : capacité non implémentée
        // Attendu : coûte SPECIAL_COST, inflige SPECIAL_DAMAGE à la cible
        // (via takeDamage), retourne un SpecialResult cohérent.
        target.takeDamage(SPECIAL_DAMAGE);
        this.energy -= SPECIAL_COST;
        return new SpecialResult("Bouclier d'impact", SPECIAL_DAMAGE, 0, SPECIAL_COST);
    }
}
