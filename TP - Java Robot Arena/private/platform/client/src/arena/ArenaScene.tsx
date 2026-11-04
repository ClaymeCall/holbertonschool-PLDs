import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  Sparkles,
  useTexture,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RepeatWrapping, SRGBColorSpace } from "three";
import type { CombatEvent, RobotSnapshot } from "../types";
import { FightChoreography } from "./FightChoreography";

type Props = {
  robots: RobotSnapshot[];
  current?: CombatEvent | null;
  resetToken?: number;
  /** Incrémenté à chaque nouveau combat pour rejouer l'intro face caméra. */
  boutToken?: number;
};

export function ArenaScene({ robots, current, resetToken = 0, boutToken = 0 }: Props) {
  const left = robots[0];
  const right = robots[1];

  return (
    <div className="relative h-full min-h-0 w-full bg-[#07090d]">
      <Canvas
        key={resetToken}
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [0, 4.2, 8.5], fov: 38, near: 0.1, far: 80 }}
        gl={{ antialias: true, toneMappingExposure: 1.05, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#07090d"]} />
        <fog attach="fog" args={["#07090d", 18, 46]} />

        <Suspense fallback={null}>
          <Environment
            files="/hdris/small_hangar_01_2k.hdr"
            background
            backgroundIntensity={0.32}
            environmentIntensity={0.9}
            backgroundBlurriness={0.28}
          />

          <CombatPit />

          <FightChoreography left={left} right={right} current={current} boutToken={boutToken} />

          <Sparkles count={28} scale={[12, 2.5, 8]} size={1.6} speed={0.2} opacity={0.28} color="#fdba74" />
        </Suspense>

        <hemisphereLight intensity={0.28} color="#e2e8f0" groundColor="#0f172a" />
        <directionalLight
          castShadow
          position={[4, 11, 5]}
          intensity={1.45}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0002}
        />
        <spotLight position={[0, 9, 1]} angle={0.58} penumbra={0.75} intensity={1.7} color="#fff7ed" castShadow />
        <spotLight position={[-6, 6, 5]} angle={0.45} penumbra={0.55} intensity={0.85} color="#fb923c" />
        <spotLight position={[6, 6, 5]} angle={0.45} penumbra={0.55} intensity={0.75} color="#38bdf8" />

        <ContactShadows opacity={0.72} scale={16} blur={2.2} far={8} resolution={1024} position={[0, 0.02, 0]} />

        <CameraRig />
      </Canvas>

      <div className="pointer-events-none absolute bottom-2 left-2 rounded-sm border border-white/10 bg-black/55 px-2 py-1 mono text-[10px] text-slate-400">
        Marche · coup · demi-tour · retour · tour suivant
      </div>
    </div>
  );
}

function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.target.set(0, 1.1, 0);
    c.minDistance = 5;
    c.maxDistance = 11;
    c.minPolarAngle = Math.PI / 4.2;
    c.maxPolarAngle = Math.PI / 2.35;
    c.minAzimuthAngle = -Math.PI * 0.72;
    c.maxAzimuthAngle = Math.PI * 0.72;
    c.enablePan = false;
    c.zoomSpeed = 0.55;
    c.rotateSpeed = 0.55;
    c.update();
  }, []);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 1.1, 0]}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={11}
      minPolarAngle={Math.PI / 4.2}
      maxPolarAngle={Math.PI / 2.35}
      minAzimuthAngle={-Math.PI * 0.72}
      maxAzimuthAngle={Math.PI * 0.72}
      zoomSpeed={0.55}
      rotateSpeed={0.55}
    />
  );
}

/** Fosse industrielle ouverte : textures usine, aucun pylône. */
function CombatPit() {
  const floorMaps = useTexture({
    map: "/textures/floor/metal_plate_diff.jpg",
    normalMap: "/textures/floor/metal_plate_nor.jpg",
    roughnessMap: "/textures/floor/metal_plate_arm.jpg",
    metalnessMap: "/textures/floor/metal_plate_arm.jpg",
  });
  const apronMaps = useTexture({
    map: "/models/arena/factory/textures/modular_factory_facade_brick_diff_1k.jpg",
    normalMap: "/models/arena/factory/textures/modular_factory_facade_brick_nor_gl_1k.jpg",
    roughnessMap: "/models/arena/factory/textures/modular_factory_facade_brick_arm_1k.jpg",
  });
  const trimMaps = useTexture({
    map: "/models/arena/factory/textures/modular_factory_facade_trim_01_diff_1k.jpg",
    normalMap: "/models/arena/factory/textures/modular_factory_facade_trim_01_nor_gl_1k.jpg",
    roughnessMap: "/models/arena/factory/textures/modular_factory_facade_trim_01_arm_1k.jpg",
  });

  Object.values(floorMaps).forEach((tex) => {
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(8, 8);
  });
  floorMaps.map.colorSpace = SRGBColorSpace;

  Object.values(apronMaps).forEach((tex) => {
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(10, 10);
  });
  apronMaps.map.colorSpace = SRGBColorSpace;

  Object.values(trimMaps).forEach((tex) => {
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(4, 1);
  });
  trimMaps.map.colorSpace = SRGBColorSpace;

  return (
    <group>
      {/* Apron béton / brique usine */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[16, 96]} />
        <meshStandardMaterial
          map={apronMaps.map}
          normalMap={apronMaps.normalMap}
          roughnessMap={apronMaps.roughnessMap}
          metalness={0.12}
          roughness={0.92}
          color="#9aa3ad"
        />
      </mesh>

      {/* Caniveau autour de la ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} receiveShadow>
        <ringGeometry args={[5.55, 6.35, 96]} />
        <meshStandardMaterial color="#0a0e14" metalness={0.55} roughness={0.7} />
      </mesh>

      {/* Plateforme centrale métal usé */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[5.55, 96]} />
        <meshStandardMaterial
          map={floorMaps.map}
          normalMap={floorMaps.normalMap}
          roughnessMap={floorMaps.roughnessMap}
          metalnessMap={floorMaps.metalnessMap}
          metalness={0.9}
          roughness={0.42}
        />
      </mesh>

      {/* Marquage ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[5.15, 5.45, 96]} />
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.032, 0]}>
        <ringGeometry args={[4.95, 5.12, 96]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[2.35, 2.48, 72]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Axes de duel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]}>
        <planeGeometry args={[0.05, 8.8]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.028, 0]}>
        <planeGeometry args={[0.035, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.45} />
      </mesh>

      {/* Pare-chocs bas texturés */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r = 5.62;
        return (
          <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.42, 0.44, 0.22]} />
              <meshStandardMaterial
                map={trimMaps.map}
                normalMap={trimMaps.normalMap}
                roughnessMap={trimMaps.roughnessMap}
                metalness={0.75}
                roughness={0.35}
                color="#cbd5e1"
              />
            </mesh>
            <mesh position={[0, 0.46, 0]}>
              <boxGeometry args={[1.42, 0.04, 0.08]} />
              <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Murs d'enceinte loin (hors zone de zoom) */}
      {[
        { pos: [0, 1.1, -11.5] as [number, number, number], rot: 0, w: 18, h: 2.4 },
        { pos: [-12.2, 1.0, -2] as [number, number, number], rot: Math.PI / 2, w: 14, h: 2.2 },
        { pos: [12.2, 1.0, -2] as [number, number, number], rot: -Math.PI / 2, w: 14, h: 2.2 },
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos} rotation={[0, wall.rot, 0]} receiveShadow>
          <boxGeometry args={[wall.w, wall.h, 0.45]} />
          <meshStandardMaterial
            map={apronMaps.map}
            normalMap={apronMaps.normalMap}
            roughnessMap={apronMaps.roughnessMap}
            metalness={0.15}
            roughness={0.88}
            color="#8b949e"
          />
        </mesh>
      ))}

      {/* Gradins arrière */}
      {[0, 1, 2, 3].map((step) => (
        <mesh
          key={step}
          rotation={[-Math.PI / 2.2, 0, 0]}
          position={[0, 0.12 + step * 0.32, -8.1 - step * 0.48]}
          receiveShadow
        >
          <ringGeometry args={[8 + step * 0.7, 9.6 + step * 0.75, 56, 1, Math.PI * 1.12, Math.PI * 0.76]} />
          <meshStandardMaterial
            map={apronMaps.map}
            normalMap={apronMaps.normalMap}
            roughnessMap={apronMaps.roughnessMap}
            metalness={0.1}
            roughness={0.9}
            color={step % 2 ? "#7a828c" : "#6b7280"}
          />
        </mesh>
      ))}

      {/* Écrans LED latéraux éloignés */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 9.4, 2.1, -3.2]} rotation={[0, -side * 0.42, 0]}>
          <mesh>
            <boxGeometry args={[0.18, 2.6, 3.4]} />
            <meshStandardMaterial color="#0b1220" metalness={0.65} roughness={0.35} />
          </mesh>
          <mesh position={[side * -0.1, 0.05, 0]}>
            <planeGeometry args={[2.9, 2]} />
            <meshStandardMaterial
              color="#0f172a"
              emissive={side > 0 ? "#ea580c" : "#0369a1"}
              emissiveIntensity={0.45}
            />
          </mesh>
        </group>
      ))}

      {/* Grilles d'évacuation */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}-${sz}`} rotation={[-Math.PI / 2, 0, 0]} position={[sx * 3.4, 0.035, sz * 3.1]}>
            <planeGeometry args={[0.9, 0.55]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.28} />
          </mesh>
        ))
      )}
    </group>
  );
}
