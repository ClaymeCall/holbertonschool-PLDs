package arena.robot;

/**
 * MISSION 6 : Votre combattant.
 *
 * Contraintes de budget (obligatoires) :
 * - maxHealth entre 80 et 150
 * - attackPower entre 10 et 30
 * - energy initiale entre 80 et 120
 * - maxHealth + (attackPower * 3) + (energy / 2) <= 280  (budget total)
 *
 * Capacité spéciale :
 * - coût entre 10 et 40
 * - via SpecialAbility : champ délégué (recommandé) OU « implements SpecialAbility »
 * - useSpecial doit appeler cette capacité (label/coût alignés)
 * - ne doit pas modifier le moteur de combat
 *
 * Remplacez cette coquille par votre conception.
 */
public class Challenger extends Robot implements SpecialAbility {
  private static final int SPECIAL_COST = 10;
  private static final String SPECIAL_NAME = "Double sabre";

  public Challenger(String id, String name) {
    // Budget : 130 + 30*3 + 120/2 = 280
    super(id, name, 130, 30, 120);
  }

  @Override
  public String abilityName() {
    return SPECIAL_NAME;
  }

  @Override
  public int energyCost() {
    return SPECIAL_COST;
  }

  @Override
  public SpecialResult execute(Robot self, Robot target) {
    int specialDamage = self.getAttackPower() * 2;
    target.takeDamage(specialDamage);
    self.spendEnergy(SPECIAL_COST);
    return new SpecialResult(SPECIAL_NAME, specialDamage, 0, SPECIAL_COST);
  }

  @Override
  public SpecialResult useSpecial(Robot target) {
    return execute(this, target);
  }
}
