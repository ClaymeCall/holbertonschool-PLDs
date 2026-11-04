package arena.platform;

import arena.robot.Tank;

import static arena.platform.TestAssert.assertEquals;
import static arena.platform.TestAssert.assertTrue;

/**
 * Mission 1 : énergie d'instance + equals + constructeur (this).
 */
public class Mission1Test implements MissionTest {

    @Override
    public String missionId() {
        return "m1";
    }

    @Override
    public String title() {
        return "Réinitialisation impossible";
    }

    @Override
    public void run() {
        Tank atlas = new Tank("t-atlas", "Atlas");
        Tank nova = new Tank("t-nova", "Nova");

        assertEquals("Atlas doit démarrer à 100 d'énergie", 100, atlas.getEnergy());
        assertEquals("Nova doit démarrer à 100 d'énergie", 100, nova.getEnergy());

        atlas.spendEnergy(20);

        assertEquals("Après dépense, Atlas doit avoir 80", 80, atlas.getEnergy());
        assertEquals("Nova doit conserver 100 (énergie non partagée)", 100, nova.getEnergy());

        assertEquals("getId doit retourner l'id du constructeur", "t-atlas", atlas.getId());
        assertEquals("getName doit retourner le nom du constructeur", "Atlas", atlas.getName());

        Tank atlasClone = new Tank("other", "Atlas");
        assertTrue("equals doit comparer le contenu du nom", atlas.equals(atlasClone));
        assertTrue("hashCode cohérent avec equals", atlas.hashCode() == atlasClone.hashCode());
    }
}
