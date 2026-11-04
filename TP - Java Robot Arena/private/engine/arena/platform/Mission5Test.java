package arena.platform;

import arena.combat.CombatEngine;
import arena.exception.DestroyedRobotException;
import arena.exception.InsufficientEnergyException;
import arena.robot.Sniper;
import arena.robot.Tank;

import static arena.platform.TestAssert.assertTrue;
import static arena.platform.TestAssert.fail;

/**
 * Mission 5 : exceptions métier sur actions impossibles via CombatEngine.
 */
public class Mission5Test implements MissionTest {

    @Override
    public String missionId() {
        return "m5";
    }

    @Override
    public String title() {
        return "Combat interrompu";
    }

    @Override
    public void run() throws Exception {
        CombatEngine engine = new CombatEngine();

        Tank dead = new Tank("d1", "Scrap");
        dead.takeDamage(10_000);
        Tank alive = new Tank("a1", "Alive");

        try {
            engine.performAttack(1, dead, alive);
            fail("Un robot détruit ne doit pas pouvoir attaquer (performAttack)");
        } catch (DestroyedRobotException expected) {
            assertTrue("Message non vide", expected.getMessage() != null && !expected.getMessage().isBlank());
        }

        try {
            engine.performSpecial(1, dead, alive);
            fail("Un robot détruit ne doit pas pouvoir lancer un spécial");
        } catch (DestroyedRobotException expected) {
            assertTrue("Spécial refusé si détruit", true);
        }

        Sniper tired = new Sniper("s1", "Tired");
        while (tired.getEnergy() >= 20) {
            tired.spendEnergy(20);
        }
        try {
            engine.performAttack(2, tired, alive);
            fail("Énergie insuffisante doit lever InsufficientEnergyException");
        } catch (InsufficientEnergyException expected) {
            assertTrue("Exception énergie sur attaque", true);
        }

        // ensureEnergy reste le contrat utilitaire attendu
        try {
            engine.ensureEnergy(tired, 20);
            fail("ensureEnergy doit lever si réserve trop basse");
        } catch (InsufficientEnergyException expected) {
            assertTrue("ensureEnergy cohérent", true);
        }
    }
}
