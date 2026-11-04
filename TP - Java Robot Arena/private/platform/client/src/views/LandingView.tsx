import { useEffect, useRef, useState } from "react";

type Props = {
  facility: string;
  season: string;
  onEnter: () => void;
};

export function LandingView({ facility, season, onEnter }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [bootLine, setBootLine] = useState(0);
  const [muted, setMuted] = useState(true);

  const lines = [
    "Liaison sécurisée AEGIS… OK",
    "Flux arène Bay-07… LIVE",
    "Frames FORGE engagées… COMBAT",
    `Saison ${season} · diagnostic ouvert`,
  ];

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (bootLine >= lines.length) return;
    const t = setTimeout(() => setBootLine((n) => n + 1), 380);
    return () => clearTimeout(t);
  }, [bootLine, lines.length]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    void v.play().catch(() => undefined);
  }, [muted]);

  return (
    <div className="relative h-full max-h-dvh min-h-0 overflow-hidden bg-black">
      {/* Vidéo combat plein écran */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-105 object-cover"
        src="/videos/robot-arena-hero.mp4"
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="auto"
      />

      {/* Voiles cinématiques */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-40" />
      <div className="pointer-events-none absolute inset-0 landing-vignette" />

      {/* Flash / pulse combat */}
      <div className="pointer-events-none absolute inset-0 landing-combat-pulse" />

      <div
        className={`relative z-10 flex h-full flex-col justify-between px-6 py-6 md:px-12 md:py-10 transition-all duration-700 ${
          ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center border border-ember-500/60 bg-black/50 shadow-glow backdrop-blur-sm">
              <span className="font-display text-xl font-bold text-ember-500">RA</span>
              <span className="led absolute -right-1 -top-1 animate-pulse bg-signal-red text-signal-red" />
            </div>
            <div>
              <div className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-ember-400">
                Aegis Combat Complex
              </div>
              <div className="mono text-slate-400">Bay-07 · Saison {season} · LIVE FEED</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-sm border border-signal-red/40 bg-black/50 px-3 py-1.5 mono text-xs text-signal-red sm:flex">
              <span className="led bg-signal-red text-signal-red animate-pulse" />
              COMBAT EN COURS
            </div>
            <button
              type="button"
              className="btn btn-ghost pointer-events-auto border-white/20 bg-black/40 backdrop-blur-sm"
              onClick={() => setMuted((m) => !m)}
            >
              {muted ? "Activer le son" : "Couper le son"}
            </button>
          </div>
        </header>

        <div className="max-w-2xl pb-2 pt-8 md:pb-6">
          <p className="mono mb-3 text-ember-400 animate-fade-up">
            TRANSMISSION PRIORITAIRE // SAISON {season}
          </p>
          <h1 className="font-display text-5xl font-bold uppercase leading-[0.92] tracking-wide text-white md:text-8xl animate-fade-up-delay">
            Robot
            <span className="block bg-gradient-to-r from-ember-400 to-orange-200 bg-clip-text text-transparent drop-shadow">
              Arena
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-200 md:text-xl animate-fade-up-delay-2">
            Deux frames s&apos;entrechoquent dans l&apos;arène. Le simulateur Java est hors service.
            Entre dans le centre technique, répare le moteur, puis lance ton Challenger dans le
            tournoi.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up-delay-2">
            <button
              className="btn btn-primary pointer-events-auto px-8 py-3.5 text-base shadow-[0_0_40px_rgba(249,115,22,0.45)]"
              onClick={onEnter}
            >
              Entrer dans l&apos;arène
            </button>
            <div className="mono text-xs text-slate-400">
              {facility}
              <br />
              work/ = atelier · private/ = lecture seule
            </div>
          </div>

          <ul className="mt-8 space-y-1.5 mono text-xs">
            {lines.slice(0, bootLine).map((line) => (
              <li key={line} className="text-signal-cyan">
                ▸ {line}
              </li>
            ))}
          </ul>
        </div>

        <footer className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4 mono text-[11px] text-slate-500">
          <div className="flex flex-wrap gap-5">
            <span>Java 21</span>
            <span>javac</span>
            <span>0 dépendance externe</span>
            <span className="text-ember-400">FEED · BAY-07</span>
          </div>
          <div className="text-slate-600">Flux combat cinématique · PLD Robot Arena</div>
        </footer>
      </div>
    </div>
  );
}
