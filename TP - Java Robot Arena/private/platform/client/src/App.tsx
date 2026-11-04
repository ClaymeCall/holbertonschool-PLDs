import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type {
  BattleResponse,
  Mission,
  MissionCatalog,
  RobotCard,
  TestResult,
  ValidateResponse,
  ViewId,
} from "./types";
import { Shell } from "./components/Shell";
import { ControlView } from "./views/ControlView";
import { WorkshopView } from "./views/WorkshopView";
import { MissionsView } from "./views/MissionsView";
import { TestsView } from "./views/TestsView";
import { ArenaView } from "./views/ArenaView";
import { DocsView } from "./views/DocsView";
import { LandingView } from "./views/LandingView";

/** Incrémenter le suffixe pour invalider une ancienne progression navigateur. */
const PASS_KEY = "robot-arena-passed-v2";
const ENTERED_KEY = "robot-arena-entered";

function loadPassed(): Record<string, boolean> {
  try {
    // Purge d'anciennes clés de progression (évite un m0 "passed" fantôme)
    localStorage.removeItem("robot-arena-passed");
    return JSON.parse(localStorage.getItem(PASS_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function App() {
  const [entered, setEntered] = useState(() => sessionStorage.getItem(ENTERED_KEY) === "1");
  const [view, setView] = useState<ViewId>("control");
  const [catalog, setCatalog] = useState<MissionCatalog | null>(null);
  const [robots, setRobots] = useState<RobotCard[]>([]);
  const [robotsNotice, setRobotsNotice] = useState<string | null>(null);
  const [passed, setPassed] = useState<Record<string, boolean>>(loadPassed);
  const [busy, setBusy] = useState(false);
  const [lastValidate, setLastValidate] = useState<ValidateResponse | null>(null);
  const [lastBattle, setLastBattle] = useState<BattleResponse | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState("m0");
  const [bootError, setBootError] = useState<string | null>(null);
  const [clock, setClock] = useState(() => new Date());

  const enterPlatform = useCallback(() => {
    sessionStorage.setItem(ENTERED_KEY, "1");
    setEntered(true);
    setView("control");
  }, []);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await api.health();
        const [m, r] = await Promise.all([api.missions(), api.robots()]);
        setCatalog(m);
        setRobots(r.robots);
        setRobotsNotice(r.notice ?? null);
      } catch (e) {
        setBootError(String(e));
      }
    })();
  }, []);

  const missions = catalog?.missions ?? [];
  const selectedMission: Mission | undefined = useMemo(
    () => missions.find((m) => m.id === selectedMissionId) ?? missions[0],
    [missions, selectedMissionId]
  );

  const progress = useMemo(() => {
    const total = missions.length || 1;
    const done = missions.filter((m) => passed[m.id]).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [missions, passed]);

  const applyResults = useCallback((results: TestResult[]) => {
    setPassed((prev) => {
      const next = { ...prev };
      // Mise à jour bidirectionnelle : un failed efface un ancien CLEAR
      for (const r of results) {
        next[r.id] = r.status === "passed";
      }
      localStorage.setItem(PASS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const runValidate = useCallback(
    async (missionId = "all") => {
      setBusy(true);
      try {
        const res = await api.validate(missionId);
        setLastValidate(res);
        if (res.results?.length) {
          applyResults(res.results);
        } else if (!res.compile?.ok) {
          // Compilation KO : ne pas laisser d'anciens badges verts « frais »
          setPassed((prev) => {
            const next =
              missionId === "all"
                ? Object.fromEntries(Object.keys(prev).map((id) => [id, false]))
                : { ...prev, [missionId]: false };
            localStorage.setItem(PASS_KEY, JSON.stringify(next));
            return next;
          });
        }
        setView("tests");
        return res;
      } finally {
        setBusy(false);
      }
    },
    [applyResults]
  );

  const runBattle = useCallback(async (scenarioId: string) => {
    setBusy(true);
    try {
      const res = await api.battle(scenarioId);
      setLastBattle(res);
      setView("arena");
      return res;
    } finally {
      setBusy(false);
    }
  }, []);

  if (bootError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="panel max-w-lg p-6">
          <h1 className="font-display text-2xl text-ember-500">Liaison centre coupée</h1>
          <p className="mt-2 text-slate-300">
            Impossible de joindre l’API. Vérifiez <code className="mono">docker compose up</code>.
          </p>
          <pre className="mono mt-4 overflow-auto rounded bg-black/40 p-3 text-signal-red">
            {bootError}
          </pre>
        </div>
      </div>
    );
  }

  if (!entered) {
    return (
      <LandingView
        facility={catalog?.facility ?? "Aegis Combat Complex · Bay 07"}
        season={catalog?.season ?? "2147"}
        onEnter={enterPlatform}
      />
    );
  }

  return (
    <Shell
      view={view}
      onView={setView}
      facility={catalog?.facility ?? "Aegis Combat Complex"}
      season={catalog?.season ?? "2147"}
      progress={progress}
      busy={busy}
      clock={clock}
      onCompileTest={() => runValidate("all")}
      onBackHome={() => {
        sessionStorage.removeItem(ENTERED_KEY);
        setEntered(false);
      }}
    >
      {view === "control" && (
        <ControlView
          missions={missions}
          passed={passed}
          progress={progress}
          lastValidate={lastValidate}
          onOpenMission={(id) => {
            setSelectedMissionId(id);
            setView("missions");
          }}
          onValidate={() => runValidate("all")}
          onArena={() => runBattle("diagnostic-energy")}
          busy={busy}
        />
      )}
      {view === "workshop" && <WorkshopView robots={robots} notice={robotsNotice} />}
      {view === "missions" && (
        <MissionsView
          missions={missions}
          selected={selectedMission}
          passed={passed}
          onSelect={setSelectedMissionId}
          onValidateMission={(id) => runValidate(id)}
          busy={busy}
        />
      )}
      {view === "tests" && (
        <TestsView
          lastValidate={lastValidate}
          passed={passed}
          busy={busy}
          onRun={() => runValidate("all")}
          onRunMission={(id) => runValidate(id)}
          missions={missions}
        />
      )}
      {view === "arena" && (
        <ArenaView
          battle={lastBattle}
          busy={busy}
          onRun={runBattle}
        />
      )}
      {view === "docs" && <DocsView />}
    </Shell>
  );
}
