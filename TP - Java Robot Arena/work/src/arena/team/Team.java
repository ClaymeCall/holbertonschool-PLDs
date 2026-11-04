package arena.team;

import arena.robot.Robot;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Registre d'une équipe de robots.
 *
 * BUGS INTENTIONNELS : Mission 4 :
 * - accepte des identifiants en double
 * - getRobots() expose la liste interne (modifiable depuis l'extérieur)
 * - findById / findByName incomplets
 */
public class Team {

    private final String name;
    private final List<Robot> robots = new ArrayList<>();

    public Team(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    /**
     * Ajoute un robot. Doit refuser un id déjà présent.
     * @return true si ajouté, false sinon
     */
    public boolean addRobot(Robot robot) {
        // BUG Mission 4 : aucun contrôle de doublon
        if (robot == null) {
            return false;
        }
        robots.add(robot);
        return true;
    }

    public Optional<Robot> findById(String id) {
        // BUG Mission 4 : comparaison incorrecte possible
        for (Robot r : robots) {
            if (r.getId() == id) {
                return Optional.of(r);
            }
        }
        return Optional.empty();
    }

    public Optional<Robot> findByName(String name) {
        for (Robot r : robots) {
            if (r.getName().equals(name)) {
                return Optional.of(r);
            }
        }
        return Optional.empty();
    }

    public int size() {
        return robots.size();
    }

    /**
     * Doit retourner une copie défensive, pas la liste interne.
     */
    public List<Robot> getRobots() {
        // BUG Mission 4 : exposition de la liste mutable interne
        return robots;
    }

    public List<Robot> aliveRobots() {
        List<Robot> alive = new ArrayList<>();
        for (Robot r : robots) {
            if (r.isAlive()) {
                alive.add(r);
            }
        }
        return alive;
    }
}
