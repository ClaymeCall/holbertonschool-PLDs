import { useEffect, useMemo, useState } from "react";
import type { BattleResponse, CombatEvent, RobotSnapshot } from "../types";
import { ArenaScene } from "../arena/ArenaScene";
import { Meter } from "../components/Meter";

const SCENARIOS = [
  { id: "diagnostic-energy", label: "Diagnostic énergie", desc: "Énergie partagée ?" },
  { id: "diagnostic-tank-sniper", label: "Duel Tank / Sniper", desc: "Absorb vs critique" },
  { id: "diagnostic-medic", label: "Essai Medic", desc: "Nano-réparation" },
  { id: "diagnostic-assault", label: "Essai Assault", desc: "Seraph vs Tank" },
  { id: "challenger-trial", label: "Essai Challenger", desc: "Vs Bastion" },
  { id: "tournament-demo", label: "Mini-tournoi", desc: "Challenger vs 3 refs + classement" },
];

type Props = {
  battle: BattleResponse | null;
  busy: boolean;
  onRun: (scenarioId: string) => void;
};

export function ArenaView({ battle, busy, onRun }: Props) {
  const [scenario, setScenario] = useState("diagnostic-energy");
  /** -1 = combat chargé, en attente de Play (pas encore de coup). */
  const [cursor, setCursor] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [cameraReset, setCameraReset] = useState(0);
  const [boutToken, setBoutToken] = useState(0);

  const events = battle?.events ?? [];
  const current: CombatEvent | null = cursor >= 0 ? events[cursor] ?? null : null;

  /** Roster rejoué depuis l'état INITIAL renvoyé par l'API (HP + énergie de départ). */
  const rosterState: RobotSnapshot[] = useMemo(() => {
    if (!battle?.robots) return [];
    const roster = battle.robots.map((r, index) =>
      withDisplayName(
        {
          ...r,
          destroyed: false,
        },
        index
      )
    );

    if (cursor < 0 || !events.length) return roster;

    const state = roster.map((r) => ({ ...r }));
    for (let i = 0; i <= cursor && i < events.length; i++) {
      const e = events[i];
      for (let index = 0; index < state.length; index++) {
        const r = state[index];
        const isActor = matchesFighter(r, e.actorId, e.actorName);
        const isTarget = matchesFighter(r, e.targetId, e.targetName);

        // Nouveau match du challenge : reset HP/EN (pas une continuité de PV)
        if (e.type === "MATCH_START") {
          if (isActor) {
            state[index] = {
              ...r,
              health: e.actorHealthAfter,
              energy: e.actorEnergyAfter,
              destroyed: false,
            };
          } else if (isTarget) {
            state[index] = {
              ...r,
              health: e.targetHealthAfter,
              // energySpent porte l'EN initiale de la cible sur MATCH_START
              energy: e.energySpent > 0 ? e.energySpent : r.energy,
              destroyed: false,
            };
          }
          continue;
        }

        if (isActor) {
          state[index] = {
            ...r,
            health: e.actorHealthAfter,
            energy: e.actorEnergyAfter,
            destroyed: e.actorHealthAfter <= 0,
          };
        } else if (isTarget) {
          state[index] = {
            ...r,
            health: e.targetHealthAfter,
            destroyed: e.targetHealthAfter <= 0,
          };
        }
      }
    }
    return state;
  }, [battle, cursor, events]);

  /**
   * Paire affichée : camps par préfixe d'id (chal/a/medic vs foe/b/ally…),
   * sinon index pair/impair.
   */
  const liveRobots: RobotSnapshot[] = useMemo(() => {
    if (!rosterState.length) return [];
    if (rosterState.length <= 2) return rosterState;

    const leftPool = rosterState.filter((r) => isLeftCamp(r.id));
    const rightPool = rosterState.filter((r) => !isLeftCamp(r.id));
    const left = leftPool.length ? leftPool : rosterState.filter((_, i) => i % 2 === 0);
    const right = rightPool.length ? rightPool : rosterState.filter((_, i) => i % 2 === 1);
    return [pickSideFighter(left, current), pickSideFighter(right, current)];
  }, [rosterState, current]);

  const showWinner =
    !!battle?.winner && events.length > 0 && cursor >= events.length - 1 && !playing;

  useEffect(() => {
    setCursor(-1);
    setPlaying(false);
    if (battle) setBoutToken((n) => n + 1);
  }, [battle]);

  useEffect(() => {
    if (!playing || events.length === 0) return;

    let cancelled = false;
    let timer = 0;

    const scheduleNext = (from: number) => {
      const currentEvent = from < 0 ? null : events[from];
      // ERROR (énergie insuffisante, etc.) : pas d'anim → on enchaîne vite
      const delay =
        currentEvent?.type === "ERROR" ||
        currentEvent?.type === "RECHARGE" ||
        currentEvent?.type === "MATCH_START"
          ? 1100
          : currentEvent && currentEvent.healing > 0 && currentEvent.damage <= 0
            ? 5600
            : currentEvent && currentEvent.damage > 0 && currentEvent.targetHealthAfter <= 0
              ? 5800
              : 5200;

      timer = window.setTimeout(() => {
        if (cancelled) return;
        setCursor((c) => {
          const next = c < 0 ? 0 : c + 1;
          if (next >= events.length) {
            setPlaying(false);
            return Math.max(0, events.length - 1);
          }
          scheduleNext(next);
          return next;
        });
      }, delay);
    };

    scheduleNext(cursor);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // cursor volontairement omis : on ne relance la chaîne qu'à Play / nouveau combat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, events]);

  const togglePlay = () => {
    if (!events.length) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    // Démarre (ou reprend) : le premier coup part seulement ici, pas au Lancer
    if (cursor < 0) setCursor(0);
    setPlaying(true);
  };

  const displayRobots =
    liveRobots.length > 0
      ? liveRobots.slice(0, 2)
      : [
          emptySlot("A", "Tank"),
          emptySlot("B", "Sniper"),
        ];

  return (
    <div className="page-fit-grid grid-cols-1 lg:grid-cols-12">
      <div className="flex min-h-0 flex-col gap-2 md:gap-3 lg:col-span-8">
        <section className="panel min-h-[240px] flex-1">
          <div className="panel-header">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
              Arène Bay-07
            </h2>
            <span className={`mono text-[11px] ${showWinner ? "text-ember-400" : "text-slate-500"}`}>
              {showWinner ? `WIN · ${battle?.winner}` : battle ? "EN COURS" : "STANDBY"}
            </span>
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0">
              <ArenaScene
                robots={liveRobots}
                current={current}
                resetToken={cameraReset}
                boutToken={boutToken}
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-t border-white/10 p-2 md:gap-2 md:p-2.5">
            <button className="btn btn-primary py-1.5 text-xs md:py-2 md:text-sm" disabled={busy} onClick={() => onRun(scenario)}>
              {busy ? "Calcul…" : "Lancer"}
            </button>
            <button className="btn py-1.5 text-xs md:py-2 md:text-sm" disabled={!events.length} onClick={togglePlay}>
              {playing ? "Pause" : "Play"}
            </button>
            <button
              className="btn py-1.5 text-xs"
              disabled={!events.length || cursor <= 0}
              onClick={() => {
                setPlaying(false);
                setCursor((c) => Math.max(0, c - 1));
              }}
            >
              −
            </button>
            <button
              className="btn py-1.5 text-xs"
              disabled={!events.length || cursor >= events.length - 1}
              onClick={() => {
                setPlaying(false);
                setCursor((c) => (c < 0 ? 0 : Math.min(events.length - 1, c + 1)));
              }}
            >
              +
            </button>
            <button
              className="btn py-1.5 text-xs md:py-2 md:text-sm"
              onClick={() => setCameraReset((n) => n + 1)}
              title="Recentrer la caméra"
            >
              Recentrer
            </button>
            <span className="mono ml-auto text-[10px] text-slate-400 md:text-xs">
              {!events.length
                ? "0 evt"
                : cursor < 0
                  ? `Prêt · ${events.length} evt`
                  : `${cursor + 1}/${events.length}`}
            </span>
          </div>
        </section>

        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3">
          {displayRobots.map((r, i) => (
            <RobotTelemetry
              key={`${r.id}-${r.type}-${i}`}
              robot={r}
              highlight={current?.actorId === r.id || current?.actorName === r.name}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-2 md:gap-3 lg:col-span-4">
        <section className="panel max-h-40 shrink-0 lg:max-h-[32%]">
          <div className="panel-header">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider">Scénarios</h2>
          </div>
          <div className="panel-scroll space-y-1 p-1.5 md:p-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`w-full rounded-sm border px-2.5 py-1.5 text-left md:px-3 md:py-2 ${
                  scenario === s.id
                    ? "border-ember-500/50 bg-ember-500/10"
                    : "border-white/10 bg-slag-800/40 hover:bg-white/5"
                }`}
              >
                <div className="font-display text-sm font-semibold">{s.label}</div>
                <div className="text-[11px] text-slate-400">{s.desc}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel min-h-0 flex-1">
          <div className="panel-header">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider">Journal</h2>
            {current && <span className="mono text-[10px] text-ember-400">{current.type}</span>}
          </div>
          <div className="panel-scroll space-y-1.5 p-2 md:p-2.5">
            {battle?.ranking && battle.ranking.length > 0 && (
              <div className="rounded-sm border border-ember-500/30 bg-ember-500/5 p-2 text-[11px] text-slate-300">
                <div className="mono mb-1 text-[10px] text-ember-400">
                  CLASSEMENT · challenge vs 3 refs (3 pts / victoire)
                </div>
                <ul className="space-y-0.5">
                  {battle.ranking.map((row) => (
                    <li key={`${row.rank}-${row.name}`} className="flex justify-between gap-2">
                      <span>
                        #{row.rank} {row.name}
                        <span className="text-slate-500"> · {row.type}</span>
                      </span>
                      <span className="mono text-slate-500">
                        {row.points ?? 0} pts · {row.wins ?? 0}V/{row.losses ?? 0}D
                        {(row.draws ?? 0) > 0 ? `/${row.draws}N` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {battle?.error && (
              <div className="rounded-sm border border-signal-red/40 bg-signal-red/10 p-2 text-xs text-signal-red">
                {battle.error}
              </div>
            )}
            {!events.length && (
              <div className="rounded-sm border border-dashed border-white/15 bg-black/20 p-3 text-xs text-slate-400">
                Lancez un scénario pour alimenter l’animation et ce journal.
              </div>
            )}
            {events.map((e, i) => (
              <button
                key={`${e.turn}-${i}`}
                onClick={() => setCursor(i)}
                className={`w-full rounded-sm border px-2.5 py-1.5 text-left ${
                  i === cursor
                    ? "border-ember-500/50 bg-ember-500/10"
                    : "border-white/10 bg-slag-800/50 hover:bg-white/5"
                }`}
              >
                <div className="mono text-[10px] text-slate-500">
                  T{e.turn} · {e.type}
                  {e.damage > 0 && e.targetHealthAfter <= 0 ? (
                    <span className="ml-1.5 text-signal-red">· KO</span>
                  ) : null}
                </div>
                <div className="line-clamp-2 text-xs text-slate-200 md:text-sm">
                  {e.message}
                  {e.damage > 0 && e.targetHealthAfter <= 0 ? ` · KO ${e.targetName}` : ""}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function RobotTelemetry({
  robot,
  highlight,
}: {
  robot: RobotSnapshot;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-sm border p-2 md:p-2.5 ${
        highlight ? "border-ember-500/40 bg-ember-500/10" : "border-white/10 bg-slag-900/80"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-semibold md:text-base">{robot.name}</div>
          <div className="mono text-[10px] text-slate-500">{robot.type}</div>
        </div>
        <span className={`mono text-[10px] ${robot.destroyed ? "text-signal-red" : "text-signal-green"}`}>
          {robot.destroyed ? "KO" : "OK"}
        </span>
      </div>
      <div className="space-y-1.5">
        <Meter label="HP" value={Math.max(0, robot.health)} max={robot.maxHealth || 1} color="#ef4444" />
        <Meter label="EN" value={Math.max(0, robot.energy)} max={120} color="#22d3ee" />
      </div>
    </div>
  );
}

function emptySlot(tag: string, type: string): RobotSnapshot {
  return {
    id: `slot-${tag}`,
    name: `Slot ${tag}`,
    type,
    health: 0,
    maxHealth: 100,
    energy: 0,
    attackPower: 0,
    destroyed: false,
  };
}

function withDisplayName(r: RobotSnapshot, index: number): RobotSnapshot {
  const broken = !r.name || r.name === "null" || !r.id || r.id === "null";
  if (!broken) return r;
  return {
    ...r,
    id: r.id && r.id !== "null" ? r.id : `fighter-${index}`,
    name: r.name && r.name !== "null" ? r.name : `${r.type || "Robot"} ${index === 0 ? "A" : "B"}`,
  };
}

function matchesFighter(r: RobotSnapshot, id?: string, name?: string) {
  if (id && r.id === id) return true;
  if (name && r.name === name) return true;
  return false;
}

/** Camp gauche : Challenger / Alpha / Medic… */
function isLeftCamp(id: string) {
  return /^(chal|a\d|medic|atlas|alpha|assault)/i.test(id);
}

/** Sur un camp : priorise le robot cité dans l'événement, sinon le premier encore debout. */
function pickSideFighter(pool: RobotSnapshot[], current: CombatEvent | null): RobotSnapshot {
  if (!pool.length) return emptySlot("?", "Robot");
  if (current) {
    const involved = pool.find(
      (r) =>
        matchesFighter(r, current.actorId, current.actorName) ||
        matchesFighter(r, current.targetId, current.targetName)
    );
    if (involved) return involved;
  }
  return pool.find((r) => !r.destroyed && r.health > 0) ?? pool[0];
}
