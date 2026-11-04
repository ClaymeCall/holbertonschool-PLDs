package arena.platform;

import arena.robot.Challenger;
import arena.robot.Robot;
import arena.robot.SpecialAbility;
import arena.robot.Tank;

import java.lang.reflect.Field;

import static arena.platform.TestAssert.assertTrue;
import static arena.platform.TestAssert.fail;

/**
 * Mission 6 : Challenger homologable + capacité via SpecialAbility
 * (délégation par champ OU Challenger implements SpecialAbility).
 */
public class Mission6Test implements MissionTest {

    @Override
    public String missionId() {
        return "m6";
    }

    @Override
    public String title() {
        return "Nouveau challenger";
    }

    @Override
    public void run() {
        Challenger hero = new Challenger("chal-1", "CustomHero");

        SpecialAbility ability = resolveAbility(hero);
        assertTrue(
                "Challenger doit utiliser SpecialAbility "
                        + "(champ délégué OU « implements SpecialAbility »)",
                ability != null
        );
        assertTrue("abilityName non vide", ability.abilityName() != null && !ability.abilityName().isBlank());
        assertTrue("energyCost entre 10 et 40", ability.energyCost() >= 10 && ability.energyCost() <= 40);

        int hp = hero.getMaxHealth();
        int atk = hero.getAttackPower();
        int en = hero.getEnergy();

        assertTrue("HP entre 80 et 150", hp >= 80 && hp <= 150);
        assertTrue("ATK entre 10 et 30", atk >= 10 && atk <= 30);
        assertTrue("Énergie entre 80 et 120", en >= 80 && en <= 120);

        int budget = hp + (atk * 3) + (en / 2);
        assertTrue("Budget total <= 280 (obtenu=" + budget + ")", budget <= 280);

        Tank target = new Tank("foe", "Foe");
        int foeBefore = target.getHealth();
        int heroEnBefore = hero.getEnergy();

        Robot.SpecialResult result = hero.useSpecial(target);

        assertTrue("Capacité nommée", result.label() != null && !result.label().isBlank());
        assertTrue("Capacité non factice (label)", !"Non homologué".equals(result.label()));
        assertTrue("Label aligné sur SpecialAbility", ability.abilityName().equals(result.label()));
        assertTrue("Coût spécial entre 10 et 40", result.energySpent() >= 10 && result.energySpent() <= 40);
        assertTrue("Coût aligné sur SpecialAbility", result.energySpent() == ability.energyCost());
        assertTrue("Énergie débitée", hero.getEnergy() == heroEnBefore - result.energySpent());

        boolean effect = result.damageDealt() > 0 || result.healingDone() > 0
                || target.getHealth() != foeBefore || hero.getHealth() != hero.getMaxHealth();
        if (!effect) {
            fail("La capacité spéciale doit produire un effet observable");
        }
    }

    /** Accepte délégation (champ SpecialAbility) ou Challenger implements SpecialAbility. */
    private static SpecialAbility resolveAbility(Robot hero) {
        if (hero instanceof SpecialAbility sa) {
            return sa;
        }
        Class<?> type = hero.getClass();
        while (type != null && type != Object.class) {
            for (Field field : type.getDeclaredFields()) {
                if (SpecialAbility.class.isAssignableFrom(field.getType())) {
                    try {
                        field.setAccessible(true);
                        Object value = field.get(hero);
                        if (value instanceof SpecialAbility sa) {
                            return sa;
                        }
                    } catch (IllegalAccessException ignored) {
                        // continue
                    }
                }
            }
            type = type.getSuperclass();
        }
        return null;
    }
}
