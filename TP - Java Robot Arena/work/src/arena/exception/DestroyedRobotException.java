package arena.exception;

public class DestroyedRobotException extends ArenaException {

    public DestroyedRobotException(String robotName) {
        super("Action impossible : le robot '" + robotName + "' est détruit.");
    }
}
