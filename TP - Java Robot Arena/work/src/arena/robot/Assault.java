package arena.robot;

/**
 * Robot d'assaut : mobilité offensive, capacité "Salve d'assaut".
 *
 * Budget de référence : HP 115, ATK 24, EN 100
 *
 * Complet (référence) : vous pouvez vous en inspirer pour le Challenger.
 */
public class Assault extends Robot {

    private static final int SPECIAL_COST = 28;
    private static final int SPECIAL_DAMAGE = 36;

    public Assault(String id, String name) {
        super(id, name, 115, 24, 100);
    }

    @Override
    public SpecialResult useSpecial(Robot target) {
        if (target == null || !isAlive()) {
            return new SpecialResult("Salve d'assaut", 0, 0, 0);
        }
        spendEnergy(SPECIAL_COST);
        target.takeDamage(SPECIAL_DAMAGE);
        return new SpecialResult("Salve d'assaut", SPECIAL_DAMAGE, 0, SPECIAL_COST);
    }
}
