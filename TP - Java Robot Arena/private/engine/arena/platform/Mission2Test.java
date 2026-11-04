package arena.platform;

import arena.robot.Sniper;
import arena.robot.Tank;

import static arena.platform.TestAssert.assertEquals;
import static arena.platform.TestAssert.assertTrue;

/**
 * Mission 2 : encapsulation : PV bornés, dégâts négatifs refusés, repair plafonné.
 */
public class Mission2Test implements MissionTest {

    @Override
    public String missionId() {
        return "m2";
    }

    @Override
    public String title() {
        return "Robots hors limites";
    }

    @Override
    public void run() {
        Tank tank = new Tank("tank-1", "Bastion");
        int before = tank.getHealth();

        tank.takeDamage(-30);
        assertEquals("Des dégâts négatifs ne doivent pas soigner", before, tank.getHealth());

        tank.takeDamage(50);
        assertEquals("Dégâts positifs appliqués (hors mitigation Tank testée en m3)",
                true, tank.getHealth() < before);

        Sniper sniper = new Sniper("snp-1", "Needle");
        sniper.takeDamage(10_000);
        assertTrue("Un robot à 0 PV doit être détruit", sniper.isDestroyed());
        assertEquals("Les PV ne doivent pas passer sous 0", 0, sniper.getHealth());

        sniper.repair(20);
        assertEquals("Un robot détruit ne doit pas être réparé par repair()", 0, sniper.getHealth());
        assertTrue("Reste détruit", sniper.isDestroyed());

        Tank full = new Tank("tank-2", "Aegis");
        int max = full.getMaxHealth();
        full.repair(999);
        assertEquals("repair ne dépasse pas maxHealth", max, full.getHealth());
    }
}
