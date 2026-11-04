package arena.platform;

import arena.robot.Medic;
import arena.robot.Robot;
import arena.robot.Sniper;
import arena.robot.Tank;

import static arena.platform.TestAssert.assertEquals;
import static arena.platform.TestAssert.assertTrue;

/**
 * Mission 3 : comportements distincts Tank / Sniper / Medic.
 */
public class Mission3Test implements MissionTest {

    @Override
    public String missionId() {
        return "m3";
    }

    @Override
    public String title() {
        return "Capacités en panne";
    }

    @Override
    public void run() {
        // --- Tank : bouclier passif ---
        Tank tank = new Tank("t1", "Bulwark");
        int before = tank.getHealth();
        tank.takeDamage(20);
        assertEquals("Tank absorbe 8 points de dégâts", before - 12, tank.getHealth());

        // --- Tank : capacité spéciale ---
        Sniper dummy = new Sniper("s0", "Dummy");
        int dummyBefore = dummy.getHealth();
        int tankEnBefore = tank.getEnergy();
        Robot.SpecialResult bash = tank.useSpecial(dummy);
        assertEquals("Bouclier d'impact coûte 30", 30, bash.energySpent());
        assertEquals("Bouclier d'impact inflige 25", 25, bash.damageDealt());
        assertTrue("Cible touchée par le spécial Tank", dummy.getHealth() < dummyBefore);
        assertEquals("Énergie Tank après spécial", tankEnBefore - 30, tank.getEnergy());

        // --- Sniper : tir critique ---
        Sniper sniper = new Sniper("s1", "Longshot");
        Tank target = new Tank("t2", "Target");
        int targetBefore = target.getHealth();
        Robot.SpecialResult crit = sniper.useSpecial(target);
        assertEquals("Tir critique coûte 35", 35, crit.energySpent());
        assertEquals("Tir critique = ATK * 2", 56, crit.damageDealt());
        assertTrue("La cible a perdu des PV", target.getHealth() < targetBefore);
        assertEquals("Énergie Sniper après spécial", 100 - 35, sniper.getEnergy());

        // --- Medic : nano-réparation ---
        Medic medic = new Medic("m1", "Patch");
        assertTrue("Medic signale un spécial de soutien", medic.isSupportSpecial());
        Tank ally = new Tank("t3", "Wounded");
        ally.takeDamage(60); // 60-8 = 52 nets si bouclier OK
        int allyBeforeHeal = ally.getHealth();
        Robot.SpecialResult heal = medic.useSpecial(ally);
        assertEquals("Nano-réparation coûte 25", 25, heal.energySpent());
        assertEquals("Soin de 40", 40, heal.healingDone());
        assertEquals("PV allié après soin", Math.min(ally.getMaxHealth(), allyBeforeHeal + 40), ally.getHealth());
    }
}
