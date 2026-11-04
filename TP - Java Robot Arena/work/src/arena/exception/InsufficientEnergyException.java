package arena.exception;

public class InsufficientEnergyException extends ArenaException {

    public InsufficientEnergyException(String robotName, int required, int available) {
        super("Énergie insuffisante pour '" + robotName + "' (requis: "
                + required + ", disponible: " + available + ").");
    }
}
