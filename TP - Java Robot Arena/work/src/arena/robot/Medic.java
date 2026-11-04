package arena.robot;

/**
 * Robot de soutien : faible attaque, capacité "Nano-réparation".
 *
 * Budget de référence : HP 110, ATK 12, EN 120
 *
 * À compléter : Mission 3.
 */
public class Medic extends Robot {

    private static final int SPECIAL_COST = 25;
    private static final int HEAL_AMOUNT = 40;

    public Medic(String id, String name) {
        super(id, name, 110, 12, 120);
    }

    @Override
    public boolean isSupportSpecial() {
        return true;
    }

    @Override
    public SpecialResult useSpecial(Robot target) {
        // BUG Mission 3 : non implémenté
        // Attendu : coûte SPECIAL_COST, soigne HEAL_AMOUNT sur target (via repair),
        // ne soigne PAS un robot détruit (exception ou no-op selon Mission 5).
        return new SpecialResult("Nano-réparation", 0, 0, 0);
    }
}
