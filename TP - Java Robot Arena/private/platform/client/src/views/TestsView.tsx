import type { Mission, ValidateResponse } from "../types";

type Props = {
  lastValidate: ValidateResponse | null;
  passed: Record<string, boolean>;
  busy: boolean;
  onRun: () => void;
  onRunMission: (id: string) => void;
  missions: Mission[];
};

export function TestsView({ lastValidate, passed, busy, onRun, onRunMission, missions }: Props) {
  const cleared = missions.filter((m) => passed[m.id]).length;
  const passPct = missions.length
    ? Math.round((cleared / missions.length) * 100)
    : 0;

  return (
    <div className="page-fit-grid grid-cols-1 lg:grid-cols-12">
      <section className="panel lg:col-span-4">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            Pipeline QA
          </h2>
          <span className="mono text-[10px] text-slate-500">JDK 21</span>
        </div>
        <div className="panel-scroll space-y-2 p-2.5 md:space-y-3 md:p-3">
          <button className="btn btn-primary w-full py-2.5" disabled={busy} onClick={onRun}>
            {busy ? "Compilation / tests…" : "Compiler et tout tester"}
          </button>

          <div className="rounded-sm border border-white/10 bg-black/30 p-2.5">
            <div className="mono mb-1.5 text-[10px] text-slate-500">DERNIER RUN</div>
            <div className="mb-1.5 flex items-end justify-between">
              <div className="font-display text-2xl font-bold text-ember-400 md:text-3xl">
                {passPct}%
              </div>
              <div className="mono text-[10px] text-slate-400">
                {cleared}/{missions.length} validées
                {lastValidate ? ` · run ${lastValidate.passed}OK/${lastValidate.failed}KO` : ""}
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-sm bg-slag-700">
              <div className="h-full bg-signal-green transition-all" style={{ width: `${passPct}%` }} />
            </div>
          </div>

          <div className="mono text-[10px] text-slate-500">Tests ciblés</div>
          <div className="space-y-1">
            {missions.map((m) => {
              const result = lastValidate?.results?.find((r) => r.id === m.id);
              const isCleared = !!passed[m.id];
              const justFailed = result?.status === "failed";
              return (
                <button
                  key={m.id}
                  className="flex w-full items-center gap-2 rounded-sm border border-white/10 bg-slag-800/50 px-2.5 py-1.5 text-left hover:bg-white/5 disabled:opacity-40 md:py-2"
                  disabled={busy}
                  onClick={() => onRunMission(m.id)}
                >
                  <span
                    className={`led ${
                      isCleared
                        ? "bg-signal-green text-signal-green"
                        : justFailed
                          ? "bg-signal-red text-signal-red"
                          : "bg-slate-500 text-slate-500"
                    }`}
                    title={
                      isCleared ? "Validée" : justFailed ? "Échec du dernier run" : "Non validée"
                    }
                  />
                  <span className="min-w-0 flex-1">
                    <span className="mono text-[10px] text-slate-500">{m.id.toUpperCase()}</span>
                    <span className="block truncate text-xs text-slate-200 md:text-sm">{m.title}</span>
                  </span>
                  {isCleared && (
                    <span className="mono text-[10px] text-signal-green">CLEAR</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel lg:col-span-8">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            Console résultats
          </h2>
          {lastValidate && (
            <span className="mono text-[10px] text-slate-400">
              {lastValidate.passed}P · {lastValidate.failed}F
            </span>
          )}
        </div>
        <div className="panel-scroll space-y-2 p-2.5 md:space-y-3 md:p-3">
          {lastValidate?.compile && (
            <div
              className={`rounded-sm border px-3 py-2 ${
                lastValidate.compile.ok
                  ? "border-signal-green/30 bg-signal-green/5"
                  : "border-signal-red/40 bg-signal-red/5"
              }`}
            >
              <div className="mono text-[10px] text-slate-400">JAVAC / JDK 21</div>
              <div className="text-sm font-medium text-slate-100">{lastValidate.compile.message}</div>
              {!!lastValidate.compile.diagnostics?.length && (
                <ul className="mt-1.5 space-y-1">
                  {lastValidate.compile.diagnostics.map((d, i) => (
                    <li key={i} className="mono text-xs text-signal-red">
                      {d.file}:{d.line} {d.severity}: {d.message}
                    </li>
                  ))}
                </ul>
              )}
              {!lastValidate.compile.ok && lastValidate.compile.raw && (
                <pre className="mono mt-1.5 max-h-28 overflow-auto whitespace-pre-wrap text-xs text-signal-red">
                  {lastValidate.compile.raw}
                </pre>
              )}
            </div>
          )}

          {!lastValidate && (
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["Compilation", "javac --release 21 sur work/ + engine"],
                ["Assertions", "Chaque mission a un test dédié"],
                ["Boucle", "Corrigez → testez → observez l’arène"],
                ["Erreurs", "Fichier, ligne, message exploitables"],
              ].map(([t, b]) => (
                <div key={t} className="rounded-sm border border-dashed border-white/15 bg-black/20 p-3">
                  <div className="font-display font-semibold text-ember-400">{t}</div>
                  <p className="mt-0.5 text-xs text-slate-400">{b}</p>
                </div>
              ))}
            </div>
          )}

          {lastValidate?.results?.map((r) => (
            <div
              key={r.id}
              className={`flex items-start gap-2 rounded-sm border px-3 py-2 ${
                r.status === "passed"
                  ? "border-signal-green/20 bg-signal-green/5"
                  : "border-signal-red/30 bg-signal-red/5"
              }`}
            >
              <span
                className={`led mt-1 ${
                  r.status === "passed"
                    ? "bg-signal-green text-signal-green"
                    : "bg-signal-red text-signal-red"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-semibold text-slate-100 md:text-base">
                    {r.title}
                  </span>
                  <span className="mono text-[10px] text-slate-500">{r.id}</span>
                  <span
                    className={`ml-auto mono text-[10px] ${
                      r.status === "passed" ? "text-signal-green" : "text-signal-red"
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </div>
                <p
                  className={`mt-0.5 text-xs md:text-sm ${
                    r.status === "passed" ? "text-slate-400" : "text-signal-red"
                  }`}
                >
                  {r.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
