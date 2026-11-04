package arena.platform;

import arena.combat.CombatEngine;
import arena.robot.Medic;
import arena.robot.Sniper;
import arena.robot.Tank;
import arena.team.Team;

import static arena.platform.TestAssert.assertTrue;

/**
 * Mission 0 : diagnostic initial : le projet compile et les classes existent.
 */
public class Mission0Test implements MissionTest {

    @Override
    public String missionId() {
        return "m0";
    }

    @Override
    public String title() {
        return "Prendre son poste";
    }

    @Override
    public void run() {
        Team alpha = new Team("Alpha");
        alpha.addRobot(new Tank("t1", "Atlas"));
        alpha.addRobot(new Sniper("s1", "Nova"));
        alpha.addRobot(new Medic("m1", "Pulse"));

        assertTrue("Équipe non vide", alpha.size() >= 1);
        assertTrue("CombatEngine instanciable", new CombatEngine() != null);
        assertTrue("Au moins un robot vivant", !alpha.aliveRobots().isEmpty());
    }
}
