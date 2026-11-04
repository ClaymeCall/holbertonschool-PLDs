import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { RobotCard } from "../types";
import { MechRobot } from "../arena/MechRobot";
import { MECH_ASSETS, resolveMechRole } from "../arena/mechCatalog";
import { Meter } from "../components/Meter";

type Props = { robots: RobotCard[]; notice?: string | null };

export function WorkshopView({ robots, notice }: Props) {
  const [selectedId, setSelectedId] = useState(robots[0]?.id ?? "");
  const selected = useMemo(
    () => robots.find((r) => r.id === selectedId) ?? robots[0],
    [robots, selectedId]
  );
  const role = resolveMechRole(selected?.className);
  const asset = MECH_ASSETS[role];

  return (
    <div className="page-fit-grid grid-cols-1 lg:grid-cols-12">
      <aside className="panel max-h-48 lg:col-span-3 lg:max-h-none">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            Parc machines
          </h2>
          <span className="mono text-[10px] text-slate-500">{robots.length}</span>
        </div>
        <ul className="panel-scroll divide-y divide-white/5">
          {robots.map((r) => {
            const a = MECH_ASSETS[resolveMechRole(r.className)];
            return (
              <li key={r.id}>
                <button
                  onClick={() => setSelectedId(r.id)}
                  className={`flex w-full gap-2 px-3 py-2 text-left hover:bg-white/5 md:gap-3 md:px-4 md:py-2.5 ${
                    selected?.id === r.id ? "border-l-2 border-ember-500 bg-ember-500/10" : ""
                  }`}
                >
                  <span className="mt-1 h-8 w-1 rounded-sm" style={{ background: r.color }} />
                  <span className="min-w-0">
                    <span className="block font-display text-base font-semibold leading-tight md:text-lg">
                      {r.codename}
                    </span>
                    <span className="mono text-[10px] text-slate-500">
                      {r.className} · {a.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="panel min-h-[280px] lg:col-span-5 lg:min-h-0">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            Inspection · {selected?.codename ?? "-"}
          </h2>
          <span className="mono text-[10px] text-ember-400 md:text-xs">{asset.label}</span>
        </div>
        <div className="relative min-h-0 flex-1 bg-[#05070a]">
          {selected && (
            <Canvas
              className="!absolute inset-0 h-full w-full"
              shadows
              dpr={[1, 1.5]}
              camera={{ position: [3.4, 2.2, 3.8], fov: 32 }}
              gl={{ antialias: true, toneMappingExposure: 1.1 }}
            >
              <color attach="background" args={["#05070a"]} />
              <Suspense fallback={null}>
                <Environment
                  files="/hdris/empty_warehouse_01_2k.hdr"
                  background
                  backgroundIntensity={0.35}
                  environmentIntensity={1}
                  backgroundBlurriness={0.22}
                />
                <MechRobot
                  color={selected.color}
                  variant={selected.className.toLowerCase()}
                  healthRatio={1}
                  height={2.4}
                />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                  <circleGeometry args={[2.6, 64]} />
                  <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.35} />
                </mesh>
                <ContactShadows opacity={0.65} scale={9} blur={2.5} position={[0, 0.02, 0]} />
              </Suspense>
              <spotLight position={[3, 5, 2]} intensity={1.2} color="#fb923c" angle={0.4} />
              <OrbitControls
                target={[0, 1.1, 0]}
                enablePan={false}
                minDistance={2.4}
                maxDistance={7}
                maxPolarAngle={Math.PI / 2.05}
                autoRotate
                autoRotateSpeed={0.5}
              />
            </Canvas>
          )}
        </div>
      </section>

      <aside className="panel lg:col-span-4">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            Dossier technique
          </h2>
        </div>
        {selected && (
          <div className="panel-scroll space-y-3 p-3 md:p-4">
            <div>
              <div className="mono text-[10px] text-slate-500">CLASSE JAVA</div>
              <div className="font-display text-2xl font-bold text-ember-400 md:text-3xl">
                {selected.className}
              </div>
              <p className="text-sm text-slate-300">{asset.frame}</p>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 md:text-sm">{asset.blurb}</p>
            <div className="space-y-2 rounded-sm border border-white/10 bg-black/25 p-2.5">
              <Meter label="PV max" value={selected.maxHealth ?? 0} max={150} color="#ef4444" />
              <Meter label="Attaque" value={selected.attackPower ?? 0} max={30} color="#f97316" />
              <Meter label="Énergie" value={selected.energy ?? 0} max={120} color="#22d3ee" />
            </div>
            <div>
              <div className="mono mb-1.5 text-[10px] text-slate-500">SYSTÈMES</div>
              <div className="flex flex-wrap gap-1">
                {asset.systems.map((s) => (
                  <span
                    key={s}
                    className="rounded-sm border border-white/10 bg-slag-800 px-1.5 py-0.5 text-[11px] text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mono mb-1.5 text-[10px] text-slate-500">CHARGE UTILE</div>
              <ul className="space-y-1 text-xs text-slate-300 md:text-sm">
                {asset.loadout.map((l) => (
                  <li key={l} className="flex gap-2">
                    <span className="text-ember-500">▹</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-sm border border-dashed border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-100/80">
              {notice ||
                "Fiche de référence (cahier des charges), pas un miroir live de votre Java."}
              <div className="mt-1 text-slate-400">
                Code exécuté = <span className="mono text-ember-400">{selected.file}</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
