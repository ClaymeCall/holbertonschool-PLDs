import type { ReactNode } from "react";
import type { ViewId } from "../types";

const NAV: { id: ViewId; label: string; short: string; code: string }[] = [
  { id: "control", label: "Centre de contrôle", short: "Contrôle", code: "OPS" },
  { id: "workshop", label: "Atelier robots", short: "Atelier", code: "BAY" },
  { id: "missions", label: "Missions", short: "Missions", code: "INC" },
  { id: "tests", label: "Banc de tests", short: "Tests", code: "QA" },
  { id: "arena", label: "Arène", short: "Arène", code: "SIM" },
  { id: "docs", label: "Documentation", short: "Docs", code: "DOC" },
];

type Props = {
  view: ViewId;
  onView: (v: ViewId) => void;
  facility: string;
  season: string;
  progress: { done: number; total: number; pct: number };
  busy: boolean;
  clock: Date;
  onCompileTest: () => void;
  onBackHome?: () => void;
  children: ReactNode;
};

export function Shell({
  view,
  onView,
  facility,
  season,
  progress,
  busy,
  clock,
  onCompileTest,
  onBackHome,
  children,
}: Props) {
  const time = clock.toLocaleTimeString("fr-FR", { hour12: false });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="relative z-20 shrink-0 border-b border-white/10 bg-slag-900/95">
        <div className="flex items-center gap-2 px-3 py-2 md:gap-4 md:px-4 md:py-2.5">
          <button
            type="button"
            onClick={onBackHome}
            className="flex min-w-0 items-center gap-2 text-left transition hover:opacity-90 md:gap-3"
            title="Retour à l'accueil"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center border border-ember-500/40 bg-slag-800 shadow-glow md:h-10 md:w-10">
              <span className="font-display text-base font-bold text-ember-500 md:text-lg">RA</span>
              <span className="led absolute -right-1 -top-1 bg-signal-amber text-signal-amber" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-base font-bold uppercase tracking-[0.12em] text-slate-100 md:text-xl md:tracking-[0.14em]">
                Robot Arena
              </div>
              <div className="mono hidden truncate text-slate-400 sm:block">
                Saison {season} · {facility}
              </div>
            </div>
          </button>

          <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 md:gap-3">
            <div className="panel hidden px-3 py-1 lg:block">
              <div className="mono text-[10px] text-slate-400">HOMOLOGATION</div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-sm bg-slag-700">
                  <div
                    className="h-full bg-ember-500 transition-all"
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
                <span className="mono text-ember-400">
                  {progress.done}/{progress.total}
                </span>
              </div>
            </div>
            <div className="mono hidden text-slate-400 md:block">{time}</div>
            <button className="btn btn-primary px-2 py-1.5 text-xs md:px-3 md:py-2 md:text-sm" disabled={busy} onClick={onCompileTest}>
              {busy ? "…" : <span className="hidden sm:inline">Compiler et tester</span>}
              {busy ? null : <span className="sm:hidden">Tester</span>}
            </button>
          </div>
        </div>

        <nav className="flex gap-0.5 overflow-x-auto border-t border-white/5 px-1 py-0.5 md:gap-1 md:px-2 md:py-1">
          {NAV.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onView(item.id)}
                className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 font-display text-xs font-semibold uppercase tracking-wider transition md:px-3 md:py-2 md:text-sm ${
                  active
                    ? "border-b-2 border-ember-500 text-ember-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="mono mr-1 hidden text-[10px] text-slate-500 sm:inline md:mr-2">
                  {item.code}
                </span>
                <span className="md:hidden">{item.short}</span>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Desktop: pas de scroll page. Mobile: scroll si contenu trop haut. */}
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-metal-grid bg-[size:24px_24px] p-2 sm:p-3 lg:overflow-hidden lg:p-3 xl:p-4">
        <div className="h-auto min-h-0 lg:h-full">{children}</div>
      </main>

      <footer className="hidden shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-slag-900 px-4 py-1.5 mono text-[11px] text-slate-500 sm:flex">
        <span>work/ = atelier · private/ = lecture seule · Java 21</span>
        <span className="flex items-center gap-2">
          <span
            className={`led ${
              busy ? "bg-signal-amber text-signal-amber" : "bg-signal-green text-signal-green"
            }`}
          />
          {busy ? "PIPELINE ACTIF" : "SYSTÈME NOMINAL"}
        </span>
      </footer>
    </div>
  );
}
