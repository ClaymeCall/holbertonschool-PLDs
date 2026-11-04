package arena.robot;

/**
 * Contrat d'une capacité spéciale homologable.
 * Votre Challenger (Mission 6) doit respecter ce contrat.
 */
public interface SpecialAbility {

    /** Nom court affiché dans le journal de combat. */
    String abilityName();

    /** Coût en énergie (doit être >= 10 et <= 40). */
    int energyCost();

    /**
     * Exécute la capacité.
     * @param self  le robot qui déclenche la capacité
     * @param target la cible (peut être soi-même pour un soin)
     */
    Robot.SpecialResult execute(Robot self, Robot target);
}
