import type { Mission, ValidateResponse } from "../types";

type Props = {
  missions: Mission[];
  passed: Record<string, boolean>;
  progress: { done: number; total: number; pct: number };
  lastValidate: ValidateResponse | null;
  onOpenMission: (id: string) => void;
  onValidate: () => void;
  onArena: () => void;
  busy: boolean;
};

const BAY_STATUS = [
  { id: "PWR", label: "Réacteur Bay-07", state: "NOMINAL", ok: true },
  { id: "NET", label: "Liaison JDK 21", state: "ONLINE", ok: true },
  { id: "SIM", label: "Moteur combat", state: "DÉGRADÉ", ok: false },
  { id: "REG", label: "Registre équipes", state: "CORRUPT", ok: false },
  { id: "QA", label: "Banc de tests", state: "PRÊT", ok: true },
  { id: "3D", label: "Flux arène", state: "LIVE", ok: true },
];

export function ControlView({
  missions,
  passed,
  progress,
  lastValidate,
  onOpenMission,
  onValidate,
  onArena,
  busy,
}: Props) {
  const next = missions.find((m) => !passed[m.id]) ?? missions[missions.length - 1];
  const anomalies = missions.filter((m) => m.order > 0 && !passed[m.id]);
  const cleared = missions.filter((m) => passed[m.id]).length;

  return (
    <div className="page-fit-grid grid-cols-1 lg:grid-rows-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-cols-12">
      <section className="panel lg:col-span-8">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest md:text-lg">
            Centre de contrôle · diagnostic
          </h2>
          <span className="mono text-[10px] text-signal-amber md:text-xs">SEASON LOCK</span>
        </div>
        <div className="panel-scroll grid gap-3 p-3 md:grid-cols-5 md:p-4">
          <div className="space-y-3 md:col-span-3">
            <p className="text-sm leading-relaxed text-slate-300 md:text-base">
              Compétition imminente. Homologation bloquée : énergie partagée, invariants, capacités
              inertes, registre corrompu… Réparez le Java dans{" "}
              <span className="mono text-ember-400">work/</span>, puis présentez votre Challenger.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Progression" value={`${progress.pct}%`} detail={`${progress.done}/${progress.total}`} />
              <Stat
                label="Anomalies"
                value={String(anomalies.length)}
                detail="ouvertes"
                tone={anomalies.length ? "amber" : "green"}
              />
              <Stat
                label="Dernier run"
                value={lastValidate ? `${lastValidate.passed} OK` : "-"}
                detail={lastValidate ? `${lastValidate.failed} KO` : "aucun"}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" disabled={busy} onClick={onValidate}>
                Diagnostic complet
              </button>
              <button className="btn" disabled={busy} onClick={onArena}>
                Repro énergie
              </button>
              {next && (
                <button className="btn btn-ghost" onClick={() => onOpenMission(next.id)}>
                  {next.code}
                </button>
              )}
            </div>
          </div>
          <div className="rounded-sm border border-white/10 bg-black/30 p-3 md:col-span-2">
            <div className="mono mb-2 text-[10px] text-slate-500">RADAR HOMOLOGATION</div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-sm bg-slag-700">
              <div className="h-full bg-ember-500" style={{ width: `${progress.pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mono text-[11px]">
              <div className="rounded-sm border border-white/10 bg-slag-800/80 p-2">
                <div className="text-slate-500">CLEAR</div>
                <div className="font-display text-xl text-signal-green md:text-2xl">{cleared}</div>
              </div>
              <div className="rounded-sm border border-white/10 bg-slag-800/80 p-2">
                <div className="text-slate-500">OPEN</div>
                <div className="font-display text-xl text-signal-amber md:text-2xl">{anomalies.length}</div>
              </div>
            </div>
            {next && (
              <div className="mt-2 border-t border-white/10 pt-2">
                <div className="mono text-[10px] text-slate-500">PROCHAINE</div>
                <div className="font-display text-lg text-ember-400">{next.code}</div>
                <div className="truncate text-sm text-slate-300">{next.title}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="panel lg:col-span-4">
        <div className="panel-header">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider md:text-base">
            File d’incidents
          </h3>
          <span className="mono text-[10px] text-slate-500">{missions.length}</span>
        </div>
        <ul className="panel-scroll divide-y divide-white/5">
          {missions.map((m) => {
            const ok = !!passed[m.id];
            return (
              <li key={m.id}>
                <button
                  onClick={() => onOpenMission(m.id)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-white/5 md:gap-3 md:px-4 md:py-2.5"
                >
                  <span
                    className={`led mt-1 ${
                      ok ? "bg-signal-green text-signal-green" : "bg-signal-red text-signal-red"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="mono text-[10px] text-slate-500">{m.code}</span>
                      <span className="mono text-[10px] text-slate-500">
                        {ok ? "VALIDÉ" : m.severity.toUpperCase()}
                      </span>
                    </span>
                    <span className="block truncate text-sm font-medium text-slate-100">{m.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel lg:col-span-5">
        <div className="panel-header">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Télémétrie</h3>
        </div>
        <div className="panel-scroll grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-3">
          {BAY_STATUS.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-sm border border-white/10 bg-slag-800/60 px-2 py-1.5 md:px-3 md:py-2"
            >
              <span
                className={`led shrink-0 ${
                  s.ok ? "bg-signal-green text-signal-green" : "bg-signal-red text-signal-red"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-slate-200 md:text-sm">{s.label}</div>
              </div>
              <div className={`mono shrink-0 text-[10px] ${s.ok ? "text-signal-green" : "text-signal-red"}`}>
                {s.state}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel lg:col-span-4">
        <div className="panel-header">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Parcours</h3>
        </div>
        <ol className="panel-scroll space-y-1.5 p-2 text-sm text-slate-300 sm:p-3">
          {[
            "Poste + diagnostic initial",
            "Missions 1→5 : réparer le moteur",
            "Mission 6 : Challenger + tournoi",
          ].map((t, i) => (
            <li
              key={t}
              className="flex gap-2 rounded-sm border border-white/10 bg-black/20 px-2.5 py-2 md:gap-3 md:px-3"
            >
              <span className="font-display text-ember-400">0{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel lg:col-span-3">
        <div className="panel-header">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Raccourcis</h3>
        </div>
        <div className="panel-scroll grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-1 sm:p-3">
          {[
            ["Atelier", "Frames 3D"],
            ["Missions", "Tickets + indices"],
            ["Tests", "javac + assert"],
            ["Arène", "Combat Java"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-sm border border-white/10 bg-slag-800/50 px-2.5 py-1.5">
              <div className="font-display text-sm font-semibold text-ember-400">{k}</div>
              <div className="text-[11px] text-slate-400">{v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  tone = "ember",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "ember" | "amber" | "green";
}) {
  const color =
    tone === "green" ? "text-signal-green" : tone === "amber" ? "text-signal-amber" : "text-ember-400";
  return (
    <div className="rounded-sm border border-white/10 bg-slag-800/70 p-2 md:p-3">
      <div className="mono text-[10px] text-slate-500">{label}</div>
      <div className={`font-display text-xl font-bold md:text-3xl ${color}`}>{value}</div>
      <div className="truncate text-[11px] text-slate-400 md:text-sm">{detail}</div>
    </div>
  );
}
