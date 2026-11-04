package arena.combat;

import arena.robot.Robot;

import java.util.Comparator;

/**
 * Tri utilitaire des robots (PV restants, puis énergie, puis nom).
 * Le classement du mini-tournoi (V/D/points) est calculé dans BattleRunner,
 * pas via ce comparateur.
 */
public class RankingComparator implements Comparator<Robot> {

    @Override
    public int compare(Robot a, Robot b) {
        int byHealth = Integer.compare(b.getHealth(), a.getHealth());
        if (byHealth != 0) {
            return byHealth;
        }
        int byEnergy = Integer.compare(b.getEnergy(), a.getEnergy());
        if (byEnergy != 0) {
            return byEnergy;
        }
        return a.getName().compareTo(b.getName());
    }
}
