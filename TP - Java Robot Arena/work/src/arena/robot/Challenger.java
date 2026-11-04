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
public class Challenger extends Robot {
    // TODO Mission 6 : SpecialAbility (champ interne) + stats dans le budget

    public Challenger(String id, String name) {
        // TODO Mission 6 : choisissez vos stats dans le budget
        super(id, name, 100, 20, 100);
    }

    @Override
    public SpecialResult useSpecial(Robot target) {
        // TODO Mission 6 : délègue à ta SpecialAbility
        return new SpecialResult("Non homologué", 0, 0, 0);
    }
}
