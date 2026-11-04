import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  PointLight,
  Points,
  PointsMaterial,
  Texture,
} from "three";

type Props = {
  position: [number, number, number];
  /** Direction du coup (étincelles projetées depuis le point d'impact). */
  direction?: [number, number, number];
  power?: number;
  kind?: "hit" | "heal";
};

type Particle = {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  pz: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  heat: number;
};

function makeSprite() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.15, "rgba(255,244,200,0.9)");
  g.addColorStop(0.4, "rgba(255,140,40,0.35)");
  g.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new Texture(c);
  tex.needsUpdate = true;
  return tex;
}

function heatColor(out: Color, heat: number, t: number, heal: boolean) {
  if (heal) {
    out.setHSL(0.34, 0.85, MathUtils.lerp(0.7, 0.15, t));
    out.multiplyScalar(1 - t * 0.85);
    return out;
  }
  // Température métal : blanc → jaune → orange → rouge
  const h = heat * (1 - t);
  if (h > 0.82) out.setRGB(1.0, 0.97, 0.88);
  else if (h > 0.58) out.setRGB(1.0, 0.78, 0.28);
  else if (h > 0.32) out.setRGB(1.0, 0.38, 0.05);
  else out.setRGB(0.45, 0.08, 0.01);
  out.multiplyScalar(MathUtils.clamp(1.05 - t * 0.95, 0, 1.15));
  return out;
}

/** Étincelles type choc métal / meuleuse (points + traînées). */
export function ImpactFX({
  position,
  direction = [0, 1, 0],
  power = 0.75,
  kind = "hit",
}: Props) {
  const pointsRef = useRef<Points>(null);
  const linesRef = useRef<LineSegments>(null);
  const lightRef = useRef<PointLight | null>(null);
  const age = useRef(0);
  const tmp = useMemo(() => new Color(), []);
  const map = useMemo(() => makeSprite(), []);

  const sim = useMemo(() => {
    const count = Math.floor(55 + power * 80);
    const particles: Particle[] = [];
    const len = Math.hypot(direction[0], direction[1], direction[2]) || 1;
    const dx = direction[0] / len;
    const dy = direction[1] / len;
    const dz = direction[2] / len;

    for (let i = 0; i < count; i++) {
      // Cône depuis le point d'impact, dans le sens du coup
      const spread = 0.55;
      const ox = (Math.random() - 0.5) * spread;
      const oy = (Math.random() - 0.15) * spread;
      const oz = (Math.random() - 0.5) * spread * 0.7;
      const speed = (5 + Math.random() * 11) * (0.65 + power * 0.7);
      const vx = (dx + ox) * speed;
      const vy = (dy + oy) * speed * 0.95 + 1.1;
      const vz = (dz + oz) * speed;

      particles.push({
        x: (Math.random() - 0.5) * 0.03,
        y: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.03,
        px: 0,
        py: 0,
        pz: 0,
        vx,
        vy,
        vz,
        life: 0,
        maxLife: 0.12 + Math.random() * 0.42,
        heat: 0.75 + Math.random() * 0.25,
      });
    }

    const posArr = new Float32Array(count * 3);
    const colArr = new Float32Array(count * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(posArr, 3).setUsage(DynamicDrawUsage));
    geo.setAttribute("color", new BufferAttribute(colArr, 3).setUsage(DynamicDrawUsage));

    const mat = new PointsMaterial({
      map,
      size: 0.09 + power * 0.04,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexColors: true,
      opacity: 1,
    });

    // Traînées : 2 points par particule
    const linePos = new Float32Array(count * 2 * 3);
    const lineCol = new Float32Array(count * 2 * 3);
    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute("position", new BufferAttribute(linePos, 3).setUsage(DynamicDrawUsage));
    lineGeo.setAttribute("color", new BufferAttribute(lineCol, 3).setUsage(DynamicDrawUsage));
    const lineMat = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0.85,
      linewidth: 1,
    });

    return { particles, geo, mat, lineGeo, lineMat, posArr, colArr, linePos, lineCol };
  }, [power, map, direction]);

  useEffect(() => {
    return () => {
      sim.geo.dispose();
      sim.mat.dispose();
      sim.lineGeo.dispose();
      sim.lineMat.dispose();
      map.dispose();
    };
  }, [sim, map]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.033);
    age.current += step;
    const { particles, posArr, colArr, linePos, lineCol } = sim;
    const g = -26;
    let alive = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.px = p.x;
      p.py = p.y;
      p.pz = p.z;
      p.life += step;

      if (p.life >= p.maxLife) {
        posArr[i * 3 + 1] = -99;
        linePos[i * 6 + 1] = -99;
        linePos[i * 6 + 4] = -99;
        continue;
      }
      alive++;

      p.vy += g * step;
      p.vx *= 1 - 1.1 * step;
      p.vz *= 1 - 1.1 * step;
      p.vy *= 1 - 0.25 * step;

      p.x += p.vx * step;
      p.y += p.vy * step;
      p.z += p.vz * step;

      if (p.y < -1.2) {
        p.y = -1.2;
        p.vy *= -0.15;
        p.vx *= 0.5;
        p.vz *= 0.5;
        p.life += step * 2.2;
      }

      const t = p.life / p.maxLife;
      heatColor(tmp, p.heat, t, kind === "heal");

      posArr[i * 3] = p.x;
      posArr[i * 3 + 1] = p.y;
      posArr[i * 3 + 2] = p.z;
      colArr[i * 3] = tmp.r;
      colArr[i * 3 + 1] = tmp.g;
      colArr[i * 3 + 2] = tmp.b;

      // Traînée courte dans le sens du mouvement
      linePos[i * 6] = p.px;
      linePos[i * 6 + 1] = p.py;
      linePos[i * 6 + 2] = p.pz;
      linePos[i * 6 + 3] = p.x;
      linePos[i * 6 + 4] = p.y;
      linePos[i * 6 + 5] = p.z;

      const dim = 0.55;
      lineCol[i * 6] = tmp.r * dim;
      lineCol[i * 6 + 1] = tmp.g * dim;
      lineCol[i * 6 + 2] = tmp.b * dim;
      lineCol[i * 6 + 3] = tmp.r;
      lineCol[i * 6 + 4] = tmp.g;
      lineCol[i * 6 + 5] = tmp.b;
    }

    (sim.geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
    (sim.geo.getAttribute("color") as BufferAttribute).needsUpdate = true;
    (sim.lineGeo.getAttribute("position") as BufferAttribute).needsUpdate = true;
    (sim.lineGeo.getAttribute("color") as BufferAttribute).needsUpdate = true;

    if (pointsRef.current) pointsRef.current.visible = alive > 0;
    if (linesRef.current) linesRef.current.visible = alive > 0;

    if (lightRef.current) {
      const flash = MathUtils.clamp(1 - age.current / 0.07, 0, 1);
      lightRef.current.intensity = flash * (3.8 + power * 2.5) + Math.max(0, 1.2 - age.current * 3);
    }
  });

  return (
    <group position={position}>
      <points ref={pointsRef} geometry={sim.geo} material={sim.mat} frustumCulled={false} />
      <lineSegments ref={linesRef} geometry={sim.lineGeo} material={sim.lineMat} frustumCulled={false} />
      <pointLight ref={lightRef} color={kind === "heal" ? "#6ee7b7" : "#ffc14d"} intensity={5} distance={2.8} decay={2} />
    </group>
  );
}
