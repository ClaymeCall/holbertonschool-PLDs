package arena.platform;

import arena.robot.Tank;
import arena.team.Team;

import java.util.List;

import static arena.platform.TestAssert.assertEquals;
import static arena.platform.TestAssert.assertTrue;

/**
 * Mission 4 : registre : doublons refusés, findById, copie défensive.
 */
public class Mission4Test implements MissionTest {

    @Override
    public String missionId() {
        return "m4";
    }

    @Override
    public String title() {
        return "Registre corrompu";
    }

    @Override
    public void run() {
        Team team = new Team("Alpha");
        Tank a = new Tank("id-1", "Atlas");
        Tank b = new Tank("id-1", "Clone");
        Tank c = new Tank("id-2", "Nova");

        assertTrue("Premier ajout OK", team.addRobot(a));
        assertTrue("Doublon d'id refusé", !team.addRobot(b));
        assertTrue("Id différent accepté", team.addRobot(c));
        assertEquals("Taille = 2", 2, team.size());

        assertTrue("findById retrouve Atlas", team.findById("id-1").isPresent());
        assertEquals("Bon robot", "Atlas", team.findById("id-1").get().getName());

        List<?> exposed = team.getRobots();
        int sizeBefore = team.size();
        try {
            exposed.clear();
        } catch (UnsupportedOperationException ignored) {
            // liste immutable acceptée
        }
        assertEquals("La liste interne ne doit pas être altérable depuis l'extérieur",
                sizeBefore, team.size());
    }
}
