package arena.combat;

/**
 * Événement sérialisable pour le journal et l'animation 3D.
 */
public record CombatEvent(
        int turn,
        String type,
        String actorId,
        String actorName,
        String targetId,
        String targetName,
        int damage,
        int healing,
        int energySpent,
        int actorHealthAfter,
        int targetHealthAfter,
        int actorEnergyAfter,
        String message
) {
}
