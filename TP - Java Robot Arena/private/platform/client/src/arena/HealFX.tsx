import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  LineBasicMaterial,
  MathUtils,
  PointLight,
  PointsMaterial,
  Texture,
  Vector3,
} from "three";

type Props = {
  from: [number, number, number];
  to: [number, number, number];
};

const SEG = 8;
const MAIN_BOLTS = 5;
const BRANCHES = 4;

function writeBolt(arr: Float32Array, offsetFloats: number, a: Vector3, b: Vector3, jitter: number) {
  let w = offsetFloats;
  let prevX = a.x;
  let prevY = a.y;
  let prevZ = a.z;
  for (let i = 1; i <= SEG; i++) {
    const t = i / SEG;
    let x = MathUtils.lerp(a.x, b.x, t);
    let y = MathUtils.lerp(a.y, b.y, t);
    let z = MathUtils.lerp(a.z, b.z, t);
    if (i < SEG) {
      x += (Math.random() - 0.5) * jitter;
      y += (Math.random() - 0.5) * jitter * 0.65;
      z += (Math.random() - 0.5) * jitter;
    }
    arr[w++] = prevX;
    arr[w++] = prevY;
    arr[w++] = prevZ;
    arr[w++] = x;
    arr[w++] = y;
    arr[w++] = z;
    prevX = x;
    prevY = y;
    prevZ = z;
  }
  return w;
}

function makeGlowTex() {
  const s = 64;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(167,243,208,0.75)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new Texture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Nano-réparation : éclairs depuis le medic + scintillement sur l'allié. */
export function HealFX({ from, to }: Props) {
  const ring = useRef<Group>(null);
  const lightMedic = useRef<PointLight>(null);
  const lightAlly = useRef<PointLight>(null);
  const age = useRef(0);
  const refresh = useRef(0);

  // Origine = poings (bras levés), pas la tête
  const hands = useMemo(() => {
    const towardX = Math.sign(to[0] - from[0]) || 1;
    return new Vector3(from[0] + towardX * 0.35, from[1] + 1.75, from[2] + 0.12);
  }, [from, to]);
  const chest = useMemo(() => new Vector3(to[0], to[1] + 1.25, to[2]), [to]);

  const lines = useMemo(() => {
    const vertsPer = SEG * 2;
    const total = (MAIN_BOLTS + BRANCHES) * vertsPer;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(pos, 3).setUsage(DynamicDrawUsage));
    geo.setAttribute("color", new BufferAttribute(col, 3).setUsage(DynamicDrawUsage));
    const mat = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0.95,
    });
    return { geo, mat, pos, col, vertsPer };
  }, []);

  const sparks = useMemo(() => {
    const n = 40;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(pos, 3).setUsage(DynamicDrawUsage));
    geo.setAttribute("color", new BufferAttribute(col, 3).setUsage(DynamicDrawUsage));
    const map = makeGlowTex();
    const mat = new PointsMaterial({
      map,
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexColors: true,
    });
    const particles = Array.from({ length: n }, () => ({
      x: to[0],
      y: to[1] + 1.2,
      z: to[2],
      vx: 0,
      vy: 0,
      vz: 0,
      life: Math.random(),
      max: 0.45 + Math.random() * 0.4,
    }));
    return { geo, mat, map, pos, col, particles };
  }, [to]);

  useEffect(() => {
    return () => {
      lines.geo.dispose();
      lines.mat.dispose();
      sparks.geo.dispose();
      sparks.mat.dispose();
      sparks.map.dispose();
    };
  }, [lines, sparks]);

  useFrame((_, dt) => {
    age.current += dt;
    refresh.current += dt;

    if (refresh.current > 0.045) {
      refresh.current = 0;
      const cyan = new Color("#a5f3fc");
      const green = new Color("#86efac");
      let o = 0;
      for (let i = 0; i < MAIN_BOLTS; i++) {
        // Léger jitter autour des poings uniquement
        const start = hands
          .clone()
          .add(new Vector3((Math.random() - 0.5) * 0.16, (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.16));
        writeBolt(lines.pos, o, start, chest, 0.32);
        for (let v = 0; v < lines.vertsPer; v++) {
          const c = i % 2 ? cyan : green;
          const idx = o + v * 3;
          lines.col[idx] = c.r;
          lines.col[idx + 1] = c.g;
          lines.col[idx + 2] = c.b;
        }
        o += lines.vertsPer * 3;
      }
      for (let i = 0; i < BRANCHES; i++) {
        const tip = chest
          .clone()
          .add(new Vector3((Math.random() - 0.5) * 1.15, 0.25 + Math.random() * 1.0, (Math.random() - 0.5) * 1.15));
        writeBolt(lines.pos, o, chest, tip, 0.28);
        for (let v = 0; v < lines.vertsPer; v++) {
          const idx = o + v * 3;
          lines.col[idx] = green.r;
          lines.col[idx + 1] = green.g;
          lines.col[idx + 2] = green.b;
        }
        o += lines.vertsPer * 3;
      }
      (lines.geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
      (lines.geo.getAttribute("color") as BufferAttribute).needsUpdate = true;
    }

    for (let i = 0; i < sparks.particles.length; i++) {
      const p = sparks.particles[i];
      p.life += dt;
      if (p.life >= p.max) {
        p.life = 0;
        p.max = 0.35 + Math.random() * 0.5;
        p.x = to[0] + (Math.random() - 0.5) * 0.55;
        p.y = to[1] + 0.75 + Math.random() * 1.05;
        p.z = to[2] + (Math.random() - 0.5) * 0.55;
        p.vx = (Math.random() - 0.5) * 1.2;
        p.vy = 0.9 + Math.random() * 2.0;
        p.vz = (Math.random() - 0.5) * 1.2;
      }
      p.vy -= 3.2 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      const fade = Math.max(0, 1 - p.life / p.max);
      sparks.pos[i * 3] = p.x;
      sparks.pos[i * 3 + 1] = p.y;
      sparks.pos[i * 3 + 2] = p.z;
      const cyanish = i % 2 === 0;
      sparks.col[i * 3] = (cyanish ? 0.6 : 0.5) * fade;
      sparks.col[i * 3 + 1] = (cyanish ? 0.95 : 0.9) * fade;
      sparks.col[i * 3 + 2] = (cyanish ? 1 : 0.72) * fade;
    }
    (sparks.geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
    (sparks.geo.getAttribute("color") as BufferAttribute).needsUpdate = true;

    const pulse = 0.55 + Math.sin(age.current * 16) * 0.45;
    if (lightMedic.current) lightMedic.current.intensity = 2.8 + pulse * 3.2;
    if (lightAlly.current) lightAlly.current.intensity = 2.2 + pulse * 2.6;
    if (ring.current) {
      ring.current.rotation.z += dt * 1.7;
      const s = 1 + Math.sin(age.current * 9) * 0.07;
      ring.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Halo aux poings (source des éclairs) */}
      <mesh position={hands.toArray() as [number, number, number]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial
          color="#ecfeff"
          emissive="#22d3ee"
          emissiveIntensity={3.5}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh position={hands.toArray() as [number, number, number]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#06b6d4"
          emissiveIntensity={2}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <group ref={ring} position={[to[0], to[1] + 0.04, to[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.48, 0.78, 48]} />
          <meshStandardMaterial
            color="#86efac"
            emissive="#22c55e"
            emissiveIntensity={2.8}
            transparent
            opacity={0.78}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      </group>

      <mesh position={[to[0], to[1] + 1.3, to[2]]}>
        <sphereGeometry args={[0.62, 18, 18]} />
        <meshStandardMaterial
          color="#bbf7d0"
          emissive="#4ade80"
          emissiveIntensity={1.5}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <lineSegments geometry={lines.geo} material={lines.mat} frustumCulled={false} />
      <points geometry={sparks.geo} material={sparks.mat} frustumCulled={false} />

      <pointLight ref={lightMedic} position={hands.toArray() as [number, number, number]} color="#67e8f9" intensity={4} distance={5} />
      <pointLight ref={lightAlly} position={[to[0], to[1] + 1.35, to[2]]} color="#4ade80" intensity={3} distance={5} />
    </group>
  );
}
