package arena.combat;

import arena.exception.ArenaException;
import arena.exception.DestroyedRobotException;
import arena.exception.InsufficientEnergyException;
import arena.robot.Robot;
import arena.team.Team;

import java.util.ArrayList;
import java.util.List;

/**
 * Orchestre un duel entre deux équipes.
 *
 * Règles d'action (polymorphisme) :
 * - attaque de base (coût 20) si l'énergie le permet ;
 * - capacité spéciale périodiquement (sans instanceof de sous-classe) ;
 * - sinon recharge d'énergie (pas de spam ERROR).
 *
 * Mission 5 : sécuriser performAttack via les exceptions métier.
 */
public class CombatEngine {

  public static final int ATTACK_COST = 20;
  public static final int SPECIAL_MIN_ENERGY = 25;
  public static final int RECHARGE_AMOUNT = 30;

  public record BattleResult(
    String winnerTeam,
    List<CombatEvent> events,
    int turns
  ) {
  }

  public BattleResult run(Team teamA, Team teamB, int maxTurns) {
    List<CombatEvent> events = new ArrayList<>();
    int turn = 0;

    while (turn < maxTurns
    && !teamA.aliveRobots().isEmpty()
    && !teamB.aliveRobots().isEmpty()) {
      turn++;

      Team offense = turn % 2 == 1 ? teamA : teamB;
      Team defense = turn % 2 == 1 ? teamB : teamA;

      Robot attacker = pickFirstAlive(offense);
      Robot defender = pickFirstAlive(defense);

      if (attacker == null || defender == null) {
        break;
      }

      try {
        CombatEvent event = chooseAndAct(turn, attacker, defender, offense);
        events.add(event);
      } catch (ArenaException ex) {
        events.add(new CombatEvent(
          turn, "ERROR",
          attacker.getId(), attacker.getName(),
          defender.getId(), defender.getName(),
          0, 0, 0,
          attacker.getHealth(), defender.getHealth(),
          attacker.getEnergy(),
          ex.getMessage()
        ));
        if (ex instanceof InsufficientEnergyException) {
          attacker.restoreEnergy(RECHARGE_AMOUNT);
        }
      }
    }

    String winner;
    if (teamA.aliveRobots().isEmpty() && teamB.aliveRobots().isEmpty()) {
      winner = "DRAW";
    } else if (teamA.aliveRobots().isEmpty()) {
      winner = teamB.getName();
    } else if (teamB.aliveRobots().isEmpty()) {
      winner = teamA.getName();
    } else {
      winner = "TIMEOUT";
    }

    return new BattleResult(winner, events, turn);
  }

  private CombatEvent chooseAndAct(int turn, Robot actor, Robot foe, Team ownTeam)
  throws ArenaException {
    boolean preferSpecial = turn % 3 == 0 && actor.getEnergy() >= SPECIAL_MIN_ENERGY;
    if (preferSpecial) {
      Robot specialTarget = resolveSpecialTarget(actor, foe, ownTeam);
      return performSpecial(turn, actor, specialTarget);
    }
    if (actor.getEnergy() >= ATTACK_COST) {
      return performAttack(turn, actor, foe);
    }
    return performRecharge(turn, actor, foe);
  }

  private Robot resolveSpecialTarget(Robot actor, Robot foe, Team ownTeam) {
    if (!actor.isSupportSpecial()) {
      return foe;
    }
    Robot ally = pickMostWoundedAlive(ownTeam, actor);
    return ally != null ? ally : actor;
  }

  private Robot pickMostWoundedAlive(Team team, Robot self) {
    Robot best = null;
    int bestMissing = 0;
    for (Robot r : team.aliveRobots()) {
      int missing = r.getMaxHealth() - r.getHealth();
      if (missing > bestMissing || (missing == bestMissing && r == self)) {
        bestMissing = missing;
        best = r;
      }
    }
    if (bestMissing <= 0) {
      return self;
    }
    return best;
  }

  public CombatEvent performRecharge(int turn, Robot actor, Robot facing) {
    int before = actor.getEnergy();
    actor.restoreEnergy(RECHARGE_AMOUNT);
    return new CombatEvent(
      turn, "RECHARGE",
      actor.getId(), actor.getName(),
      facing.getId(), facing.getName(),
      0, 0, 0,
      actor.getHealth(), facing.getHealth(),
      actor.getEnergy(),
      actor.getName() + " recharge son énergie (" + before + "→" + actor.getEnergy() + ")"
    );
  }

  public CombatEvent performAttack(int turn, Robot attacker, Robot target) throws ArenaException {
    if (attacker.isDestroyed()) {
      throw new DestroyedRobotException(attacker.getName());
    }
    if (target.isDestroyed()) {
      throw new DestroyedRobotException(target.getName());
    }
    ensureEnergy(attacker, ATTACK_COST);

    int dealt = attacker.attack(target);
    target.takeDamage(dealt);

    return new CombatEvent(
      turn, "ATTACK",
      attacker.getId(), attacker.getName(),
      target.getId(), target.getName(),
      dealt, 0, ATTACK_COST,
      attacker.getHealth(), target.getHealth(),
      attacker.getEnergy(),
      attacker.getName() + " attaque " + target.getName() + " pour " + dealt + " dégâts"
    );
  }

  public CombatEvent performSpecial(int turn, Robot actor, Robot target) throws ArenaException {
    if (actor.isDestroyed()) {
      throw new DestroyedRobotException(actor.getName());
    }
    if (actor.getEnergy() < SPECIAL_MIN_ENERGY) {
      throw new InsufficientEnergyException(actor.getName(), SPECIAL_MIN_ENERGY, actor.getEnergy());
    }
    Robot.SpecialResult result = actor.useSpecial(target);
    return new CombatEvent(
      turn, "SPECIAL",
      actor.getId(), actor.getName(),
      target.getId(), target.getName(),
      result.damageDealt(), result.healingDone(), result.energySpent(),
      actor.getHealth(), target.getHealth(),
      actor.getEnergy(),
      actor.getName() + " utilise " + result.label()
    );
  }

  private Robot pickFirstAlive(Team team) {
    List<Robot> alive = team.aliveRobots();
    return alive.isEmpty() ? null : alive.get(0);
  }

  public void ensureEnergy(Robot robot, int required) throws InsufficientEnergyException {
    if (robot.getEnergy() < required) {
      throw new InsufficientEnergyException(robot.getName(), required, robot.getEnergy());
    }
  }
}
