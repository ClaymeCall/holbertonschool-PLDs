import { useEffect, useState } from "react";
import type { Mission } from "../types";

type Props = {
  missions: Mission[];
  selected?: Mission;
  passed: Record<string, boolean>;
  onSelect: (id: string) => void;
  onValidateMission: (id: string) => void;
  busy: boolean;
};

export function MissionsView({
  missions,
  selected,
  passed,
  onSelect,
  onValidateMission,
  busy,
}: Props) {
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    setHintLevel(0);
  }, [selected?.id]);

  return (
    <div className="page-fit-grid grid-cols-1 lg:grid-cols-12">
      <aside className="panel max-h-44 lg:col-span-4 lg:max-h-none">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            Tickets
          </h2>
          <span className="mono text-[10px] text-slate-500">
            {Object.values(passed).filter(Boolean).length}/{missions.length}
          </span>
        </div>
        <ul className="panel-scroll divide-y divide-white/5">
          {missions.map((m) => {
            const ok = !!passed[m.id];
            const active = selected?.id === m.id;
            return (
              <li key={m.id}>
                <button
                  onClick={() => onSelect(m.id)}
                  className={`w-full px-3 py-2 text-left hover:bg-white/5 md:px-4 md:py-2.5 ${
                    active ? "ticket bg-ember-500/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono text-[10px] text-slate-500">{m.code}</span>
                    <span className={`mono text-[10px] ${ok ? "text-signal-green" : "text-signal-amber"}`}>
                      {ok ? "CLEAR" : m.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-display text-sm font-semibold md:text-base">{m.title}</div>
                  {m.objectif && (
                    <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{m.objectif}</div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="panel lg:col-span-8">
        {selected ? (
          <>
            <div className="panel-header">
              <div className="min-w-0">
                <div className="mono text-[10px] text-slate-500">
                  {selected.code} · {selected.statusLabel}
                  {passed[selected.id] ? " · CLEAR" : ""}
                </div>
                <h2 className="truncate font-display text-lg font-bold uppercase tracking-wide md:text-2xl">
                  {selected.title}
                </h2>
              </div>
              <button
                className="btn btn-primary shrink-0 py-1.5 text-xs md:py-2 md:text-sm"
                disabled={busy}
                onClick={() => onValidateMission(selected.id)}
              >
                Valider
              </button>
            </div>

            <div className="panel-scroll space-y-3 p-3 md:space-y-4 md:p-4">
              <div className="flex flex-wrap gap-1">
                {selected.notions.map((n) => (
                  <span
                    key={n}
                    className="rounded-sm border border-ember-500/30 bg-ember-500/10 px-1.5 py-0.5 mono text-[10px] text-ember-300"
                  >
                    {n}
                  </span>
                ))}
              </div>

              {selected.objectif && (
                <div className="rounded-sm border border-signal-cyan/30 bg-signal-cyan/5 p-3">
                  <h3 className="mono mb-1 text-[11px] text-signal-cyan">OBJECTIF</h3>
                  <p className="text-sm leading-relaxed text-slate-100 md:text-[15px]">{selected.objectif}</p>
                </div>
              )}

              {selected.contexte && (
                <div className="rounded-sm border border-white/10 bg-black/25 p-3">
                  <h3 className="mono mb-1 text-[11px] text-ember-400">CONTEXTE</h3>
                  <p className="text-sm text-slate-300">{selected.contexte}</p>
                </div>
              )}

              {!!selected.symptomes?.length && (
                <div className="rounded-sm border border-signal-red/30 bg-signal-red/5 p-3">
                  <h3 className="mono mb-1.5 text-[11px] text-signal-red">BUG OBSERVÉ</h3>
                  <ul className="space-y-1.5 text-sm text-slate-200">
                    {selected.symptomes.map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="shrink-0 text-signal-red">●</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                <div className="rounded-sm border border-white/10 bg-black/25 p-3">
                  <Block title="Signalement (brief)" body={selected.signalement} />
                </div>
                <div className="rounded-sm border border-white/10 bg-black/25 p-3">
                  <Block title="Comment reproduire" body={selected.reproduire} />
                </div>
              </div>

              <div className="rounded-sm border border-signal-green/25 bg-signal-green/5 p-3">
                <h3 className="mono mb-1.5 text-[11px] text-signal-green">QUAND C’EST RÉPARÉ</h3>
                <ul className="grid gap-1 text-sm text-slate-300 md:grid-cols-2">
                  {selected.attendu.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-signal-green">▹</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <h3 className="mono mb-1.5 text-[11px] text-ember-400">FICHIERS À MODIFIER</h3>
                  <ul className="space-y-1.5">
                    {selected.files.map((f) => (
                      <li key={f.path} className="rounded-sm border border-white/10 bg-slag-800/70 px-2 py-1.5">
                        <div className="mono text-[11px] text-signal-cyan">{f.path}</div>
                        <div className="text-xs text-slate-400">{f.role}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-sm border border-white/10 bg-black/20 p-3">
                  <h3 className="mono mb-1.5 text-[11px] text-ember-400">CONTRAINTES</h3>
                  <ul className="space-y-1 text-xs text-slate-300 md:text-sm">
                    {selected.constraints.map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                  <h3 className="mono mb-1 mt-3 text-[11px] text-ember-400">VALIDATION</h3>
                  <p className="text-sm text-slate-300">{selected.validation}</p>
                </div>
              </div>

              <div className="rounded-sm border border-ember-500/20 bg-ember-500/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider md:text-base">
                    Indices
                  </h3>
                  <span className="mono text-[10px] text-slate-500">sans pénalité</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      className="btn py-1 text-xs"
                      disabled={hintLevel >= n}
                      onClick={() => setHintLevel(n)}
                    >
                      Indice {n}
                    </button>
                  ))}
                  {hintLevel > 0 && (
                    <button className="btn btn-ghost py-1 text-xs" onClick={() => setHintLevel(0)}>
                      Masquer
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-1.5">
                  {selected.hints.slice(0, hintLevel).map((h, i) => (
                    <div
                      key={i}
                      className="rounded-sm border border-ember-500/20 bg-black/30 px-2.5 py-1.5 text-sm text-slate-200"
                    >
                      <span className="mono text-ember-400">#{i + 1} </span>
                      {h}
                    </div>
                  ))}
                  {hintLevel === 0 && (
                    <p className="text-xs text-slate-500">Ouvrez un indice à la fois si vous bloquez.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-slate-400">
            Sélectionnez un ticket.
          </div>
        )}
      </section>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="mono mb-1 text-[11px] text-ember-400">{title.toUpperCase()}</h3>
      <p className="text-sm text-slate-300">{body}</p>
    </div>
  );
}
