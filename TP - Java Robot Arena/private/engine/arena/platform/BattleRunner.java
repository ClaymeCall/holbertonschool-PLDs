package arena.platform;

import arena.combat.CombatEngine;
import arena.combat.CombatEvent;
import arena.robot.Assault;
import arena.robot.Challenger;
import arena.robot.Medic;
import arena.robot.Robot;
import arena.robot.Sniper;
import arena.robot.Tank;
import arena.team.Team;

import java.util.ArrayList;
import java.util.List;

/**
 * Lance un scénario de combat nommé et imprime un JSON d'événements.
 * Usage: java arena.platform.BattleRunner <scenarioId>
 *
 * Note : avant la mission 1, Robot.getId()/getName() peuvent être null
 * (bug this). On injecte des ids d'affichage stables pour l'arène 3D
 * sans corriger le code étudiant.
 */
public class BattleRunner {

    public static void main(String[] args) {
        String scenario = args.length > 0 ? args[0] : "diagnostic-energy";
        try {
            BattlePayload payload = runScenario(scenario);
            System.out.println(payload.toJson());
        } catch (Throwable t) {
            String msg = t.getMessage() == null ? t.getClass().getSimpleName() : t.getMessage();
            System.out.println("{\"ok\":false,\"error\":\"" + escape(msg) + "\",\"events\":[]}");
            System.exit(1);
        }
    }

    private static BattlePayload runScenario(String scenario) {
        return switch (scenario) {
            case "diagnostic-energy" -> diagnosticEnergy();
            case "diagnostic-tank-sniper" -> duel(
                    new Tank("alpha-tank", "Atlas"), "alpha-tank", "Atlas",
                    new Sniper("beta-snip", "Nova"), "beta-snip", "Nova",
                    12);
            case "diagnostic-medic" -> medicScenario();
            case "diagnostic-assault" -> duel(
                    new Assault("assault-1", "Seraph"), "assault-1", "Seraph",
                    new Tank("ref-tank", "Bastion"), "ref-tank", "Bastion",
                    14);
            case "challenger-trial" -> duel(
                    new Challenger("chal-1", "Challenger"), "chal-1", "Challenger",
                    new Tank("ref-tank", "Bastion"), "ref-tank", "Bastion",
                    16);
            case "tournament-demo" -> tournamentDemo();
            default -> duel(
                    new Tank("a", "Atlas"), "a", "Atlas",
                    new Sniper("b", "Nova"), "b", "Nova",
                    10);
        };
    }

    private static BattlePayload diagnosticEnergy() {
        Tank atlas = new Tank("atlas", "Atlas");
        Tank nova = new Tank("nova", "Nova");
        List<RobotSnapshot> initial = List.of(
                snap(atlas, "atlas", "Atlas"),
                snap(nova, "nova", "Nova")
        );
        List<CombatEvent> events = new ArrayList<>();

        int atlasEnBefore = atlas.getEnergy();
        int novaEnBefore = nova.getEnergy();
        int dealt = atlas.attack(nova);
        nova.takeDamage(dealt);

        events.add(new CombatEvent(
                1, "ATTACK",
                "atlas", "Atlas",
                "nova", "Nova",
                dealt, 0, Math.max(0, atlasEnBefore - atlas.getEnergy()),
                atlas.getHealth(), nova.getHealth(), atlas.getEnergy(),
                "Atlas attaque Nova : énergie Atlas: " + atlasEnBefore + "→" + atlas.getEnergy()
                        + " | Nova: " + novaEnBefore + "→" + nova.getEnergy()
        ));

        return new BattlePayload(
                true, "diagnostic-energy", "SOLO", 1,
                initial, events, null, List.of());
    }

    private static BattlePayload medicScenario() {
        Medic medic = new Medic("medic", "Pulse");
        Tank ally = new Tank("ally", "Bastion");
        ally.takeDamage(50); // blessure préalable visible dans le replay
        List<RobotSnapshot> initial = List.of(
                snap(medic, "medic", "Pulse"),
                snap(ally, "ally", "Bastion")
        );
        List<CombatEvent> events = new ArrayList<>();
        Robot.SpecialResult r = medic.useSpecial(ally);
        events.add(new CombatEvent(
                1, "SPECIAL",
                "medic", "Pulse",
                "ally", "Bastion",
                r.damageDealt(), r.healingDone(), r.energySpent(),
                medic.getHealth(), ally.getHealth(), medic.getEnergy(),
                "Pulse utilise " + r.label()
        ));
        return new BattlePayload(
                true, "diagnostic-medic", "SOLO", 1,
                initial, events, null, List.of());
    }

    private static BattlePayload duel(
            Robot a, String idA, String nameA,
            Robot b, String idB, String nameB,
            int maxTurns
    ) {
        List<RobotSnapshot> initial = List.of(snap(a, idA, nameA), snap(b, idB, nameB));

        Team teamA = new Team("Bravo-1");
        Team teamB = new Team("Bravo-2");
        teamA.addRobot(a);
        teamB.addRobot(b);
        CombatEngine engine = new CombatEngine();
        CombatEngine.BattleResult result = engine.run(teamA, teamB, maxTurns);

        List<CombatEvent> events = relabelDuelEvents(result.events(), idA, nameA, idB, nameB);
        return new BattlePayload(
                true, "duel", result.winnerTeam(), result.turns(),
                initial, events, null, List.of());
    }

    /**
     * Challenge « Challenger contre 3 références » (pas un championnat à 6 matchs).
     * Classement : 1 ligne / concurrent, victoires / défaites / points (3 pts / victoire).
     * Chaque match commence par un événement MATCH_START (reset HP/EN pour le replay).
     */
    private static BattlePayload tournamentDemo() {
        String[][] foes = {
                {"foe-tank", "Bastion", "Tank"},
                {"foe-snip", "Nova", "Sniper"},
                {"foe-assault", "Seraph", "Assault"}
        };

        Challenger probe = new Challenger("chal-1", "Challenger");
        List<RobotSnapshot> initial = new ArrayList<>();
        initial.add(snap(probe, "chal-1", "Challenger"));
        for (String[] foe : foes) {
            initial.add(snap(createFoe(foe[0], foe[1], foe[2]), foe[0], foe[1]));
        }

        // Une entrée par concurrent (pas 3 Challenger distincts)
        java.util.LinkedHashMap<String, Standing> table = new java.util.LinkedHashMap<>();
        table.put("Challenger", new Standing("Challenger", "Challenger"));
        for (String[] foe : foes) {
            table.put(foe[1], new Standing(foe[1], foe[2]));
        }

        List<CombatEvent> allEvents = new ArrayList<>();
        int wins = 0;
        int turnCursor = 0;
        CombatEngine engine = new CombatEngine();

        for (int match = 0; match < foes.length; match++) {
            String[] foeDef = foes[match];
            Challenger hero = new Challenger("chal-1", "Challenger");
            Robot foe = createFoe(foeDef[0], foeDef[1], foeDef[2]);

            turnCursor++;
            // MATCH_START : état initial du duo (energySpent porte l'EN initiale de la cible)
            allEvents.add(new CombatEvent(
                    turnCursor, "MATCH_START",
                    "chal-1", "Challenger",
                    foeDef[0], foeDef[1],
                    0, 0, foe.getEnergy(),
                    hero.getHealth(), foe.getHealth(), hero.getEnergy(),
                    "Match " + (match + 1) + "/3 · Challenger vs " + foeDef[1]
            ));

            Team alpha = new Team("Challenger");
            Team beta = new Team(foeDef[1]);
            alpha.addRobot(hero);
            beta.addRobot(foe);

            CombatEngine.BattleResult result = engine.run(alpha, beta, 14);
            boolean heroWon = "Challenger".equals(result.winnerTeam());
            if (heroWon) {
                wins++;
                table.get("Challenger").win();
                table.get(foeDef[1]).loss();
            } else if (foeDef[1].equals(result.winnerTeam())) {
                table.get(foeDef[1]).win();
                table.get("Challenger").loss();
            } else {
                // TIMEOUT / DRAW : 1 point chacun
                table.get("Challenger").draw();
                table.get(foeDef[1]).draw();
            }

            // Relabel obligatoire : avant m1, getId()/getName() sont souvent null
            // (sinon l'UI ne sait pas qui marche / frappe → robots immobiles).
            List<CombatEvent> labeled = relabelDuelEvents(
                    result.events(),
                    "chal-1", "Challenger",
                    foeDef[0], foeDef[1]
            );
            for (CombatEvent e : labeled) {
                allEvents.add(offsetTurn(e, turnCursor));
            }
            turnCursor += Math.max(result.turns(), 0);
        }

        List<Standing> ordered = new ArrayList<>(table.values());
        ordered.sort((a, b) -> {
            int byPts = Integer.compare(b.points, a.points);
            if (byPts != 0) return byPts;
            int byWins = Integer.compare(b.wins, a.wins);
            if (byWins != 0) return byWins;
            return a.name.compareToIgnoreCase(b.name);
        });

        List<RankingRow> ranking = new ArrayList<>();
        for (int i = 0; i < ordered.size(); i++) {
            Standing s = ordered.get(i);
            ranking.add(new RankingRow(
                    i + 1, s.name, s.type,
                    s.wins, s.losses, s.draws, s.points
            ));
        }

        String winner = "Challenge " + wins + "/" + foes.length
                + " · " + (wins >= 2 ? "Challenger homologué" : "Références en tête");
        return new BattlePayload(
                true, "tournament-demo", winner, turnCursor,
                initial, allEvents, null, ranking);
    }

    /** Ligne de classement tournoi (victoires / points), une seule par concurrent. */
    private static final class Standing {
        final String name;
        final String type;
        int wins;
        int losses;
        int draws;
        int points;

        Standing(String name, String type) {
            this.name = name;
            this.type = type;
        }

        void win() {
            wins++;
            points += 3;
        }

        void loss() {
            losses++;
        }

        void draw() {
            draws++;
            points += 1;
        }
    }

    private static Robot createFoe(String id, String name, String type) {
        return switch (type) {
            case "Sniper" -> new Sniper(id, name);
            case "Assault" -> new Assault(id, name);
            default -> new Tank(id, name);
        };
    }

    private static CombatEvent offsetTurn(CombatEvent e, int offset) {
        return new CombatEvent(
                e.turn() + offset, e.type(),
                e.actorId(), e.actorName(),
                e.targetId(), e.targetName(),
                e.damage(), e.healing(), e.energySpent(),
                e.actorHealthAfter(), e.targetHealthAfter(), e.actorEnergyAfter(),
                e.message()
        );
    }

    /**
     * CombatEngine alterne équipe A (tours impairs) / B (tours pairs).
     * On réécrit les ids/noms pour l'UI tant que le bug M1 laisse getId() null.
     */
    private static List<CombatEvent> relabelDuelEvents(
            List<CombatEvent> source,
            String idA, String nameA,
            String idB, String nameB
    ) {
        List<CombatEvent> out = new ArrayList<>();
        for (CombatEvent e : source) {
            boolean aActs = e.turn() % 2 == 1;
            String actorId = aActs ? idA : idB;
            String actorName = aActs ? nameA : nameB;
            String targetId = aActs ? idB : idA;
            String targetName = aActs ? nameB : nameA;
            // Support : le spécial peut cibler un allié (même camp)
            if ("SPECIAL".equals(e.type()) && e.targetId() != null && e.targetId().equals(e.actorId())) {
                targetId = actorId;
                targetName = actorName;
            }
            String message = e.message();
            if (message != null && (message.startsWith("null ") || message.contains(" null "))) {
                message = actorName + " → " + targetName;
                if ("ERROR".equals(e.type()) && e.message() != null && !e.message().isBlank()) {
                    message = actorName + " : " + e.message();
                }
            }
            out.add(new CombatEvent(
                    e.turn(), e.type(),
                    actorId, actorName,
                    targetId, targetName,
                    e.damage(), e.healing(), e.energySpent(),
                    e.actorHealthAfter(), e.targetHealthAfter(), e.actorEnergyAfter(),
                    message
            ));
        }
        return out;
    }

    private static RobotSnapshot snap(Robot r, String fallbackId, String fallbackName) {
        String id = usable(r.getId(), fallbackId);
        String name = usable(r.getName(), fallbackName);
        return new RobotSnapshot(
                id, name, r.getClass().getSimpleName(),
                r.getHealth(), r.getMaxHealth(), r.getEnergy(), r.getAttackPower(), r.isDestroyed()
        );
    }

    private static String usable(String value, String fallback) {
        if (value == null || value.isBlank() || "null".equals(value)) {
            return fallback;
        }
        return value;
    }

    private record RobotSnapshot(
            String id, String name, String type,
            int health, int maxHealth, int energy, int attackPower, boolean destroyed
    ) {
        String toJson() {
            return "{"
                    + "\"id\":\"" + escape(id) + "\","
                    + "\"name\":\"" + escape(name) + "\","
                    + "\"type\":\"" + escape(type) + "\","
                    + "\"health\":" + health + ","
                    + "\"maxHealth\":" + maxHealth + ","
                    + "\"energy\":" + energy + ","
                    + "\"attackPower\":" + attackPower + ","
                    + "\"destroyed\":" + destroyed
                    + "}";
        }
    }

    private record RankingRow(
            int rank, String name, String type,
            int wins, int losses, int draws, int points
    ) {
        String toJson() {
            return "{"
                    + "\"rank\":" + rank + ","
                    + "\"name\":\"" + escape(name) + "\","
                    + "\"type\":\"" + escape(type) + "\","
                    + "\"wins\":" + wins + ","
                    + "\"losses\":" + losses + ","
                    + "\"draws\":" + draws + ","
                    + "\"points\":" + points
                    + "}";
        }
    }

    private record BattlePayload(
            boolean ok,
            String scenario,
            String winner,
            int turns,
            List<RobotSnapshot> robots,
            List<CombatEvent> events,
            String error,
            List<RankingRow> ranking
    ) {
        String toJson() {
            StringBuilder sb = new StringBuilder();
            sb.append("{\"ok\":").append(ok).append(',');
            sb.append("\"scenario\":\"").append(scenario).append("\",");
            sb.append("\"winner\":\"").append(winner == null ? "" : escape(winner)).append("\",");
            sb.append("\"turns\":").append(turns).append(',');
            if (error != null) {
                sb.append("\"error\":\"").append(escape(error)).append("\",");
            }
            sb.append("\"robots\":[");
            for (int i = 0; i < robots.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(robots.get(i).toJson());
            }
            sb.append("],\"events\":[");
            for (int i = 0; i < events.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(eventJson(events.get(i)));
            }
            sb.append("],\"ranking\":[");
            for (int i = 0; i < ranking.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(ranking.get(i).toJson());
            }
            sb.append("]}");
            return sb.toString();
        }
    }

    private static String eventJson(CombatEvent e) {
        return "{"
                + "\"turn\":" + e.turn() + ","
                + "\"type\":\"" + e.type() + "\","
                + "\"actorId\":\"" + escape(nullSafe(e.actorId())) + "\","
                + "\"actorName\":\"" + escape(nullSafe(e.actorName())) + "\","
                + "\"targetId\":\"" + escape(nullSafe(e.targetId())) + "\","
                + "\"targetName\":\"" + escape(nullSafe(e.targetName())) + "\","
                + "\"damage\":" + e.damage() + ","
                + "\"healing\":" + e.healing() + ","
                + "\"energySpent\":" + e.energySpent() + ","
                + "\"actorHealthAfter\":" + e.actorHealthAfter() + ","
                + "\"targetHealthAfter\":" + e.targetHealthAfter() + ","
                + "\"actorEnergyAfter\":" + e.actorEnergyAfter() + ","
                + "\"message\":\"" + escape(e.message()) + "\""
                + "}";
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ");
    }
}
