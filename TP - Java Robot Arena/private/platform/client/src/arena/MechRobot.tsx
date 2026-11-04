import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Box3, Color, Group, LoopOnce, MathUtils, Object3D, Vector3 } from "three";
import { SkeletonUtils } from "three-stdlib";
import { MECH_ASSETS, resolveMechRole } from "./mechCatalog";

type Props = {
  color?: string;
  variant?: string;
  healthRatio?: number;
  /** Position cible (lerp). */
  position?: [number, number, number];
  /** Yaw cible en radians (lerp). 0 = face caméra (+Z). */
  yaw?: number;
  /** Legacy : 1 = yaw 0, -1 = yaw PI. Ignoré si yaw est fourni. */
  facing?: 1 | -1;
  rotation?: [number, number, number];
  destroyed?: boolean;
  attacking?: boolean;
  /** Marche vers / retour (clip Walk / Run). */
  walking?: boolean;
  /**
   * Pose debout bras levés (soin) : fige PunchCombo à un keyframe haut,
   * sans genouiller (évite KneelFire).
   */
  castHold?: boolean;
  /** Clip d'attaque forcé (PunchCombo, SwordSlash, RifleBurst…). */
  attackClip?: string;
  /** Change pour rejouer l'attaque même si le clip est identique. */
  attackNonce?: number;
  hitReact?: boolean;
  height?: number;
  /** Vitesse de déplacement / rotation. */
  moveLerp?: number;
  /** Garde les pieds collés au sol (coupe le bob / dérive Y). */
  lockGround?: boolean;
};

type MeshMat = {
  isMesh?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  material?: {
    emissive?: Color;
    emissiveIntensity?: number;
    color?: Color;
    roughness?: number;
    metalness?: number;
    clone?: () => unknown;
  };
  userData: {
    baseColor?: Color;
    baseEmissive?: Color;
    baseEmissiveIntensity?: number;
    baseRoughness?: number;
  };
};

export function MechRobot(props: Props) {
  return (
    <Suspense fallback={<MechPlaceholder {...props} />}>
      <ForgeMech {...props} />
    </Suspense>
  );
}

function ForgeMech({
  color = "#c2410c",
  variant = "tank",
  healthRatio = 1,
  position = [0, 0, 0],
  yaw,
  facing = 1,
  rotation = [0, 0, 0],
  destroyed = false,
  attacking = false,
  walking = false,
  castHold = false,
  attackClip,
  attackNonce = 0,
  hitReact = false,
  height = 2.35,
  moveLerp = 8,
  lockGround = false,
}: Props) {
  const role = resolveMechRole(variant);
  const asset = MECH_ASSETS[role];
  const { scene, animations } = useGLTF(asset.url);
  const root = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const pos = useRef(new Vector3(...position));
  const currentYaw = useRef(yaw ?? (facing < 0 ? Math.PI : 0));
  const bob = useRef(0);

  const clone = useMemo(() => SkeletonUtils.clone(scene) as Object3D, [scene]);
  const targetYaw = yaw ?? (facing < 0 ? Math.PI : 0);

  useLayoutEffect(() => {
    clone.scale.set(1, 1, 1);
    clone.position.set(0, 0, 0);

    const box = new Box3().setFromObject(clone);
    const size = new Vector3();
    box.getSize(size);
    if (size.y < 0.001) return;

    clone.scale.setScalar(height / size.y);
    box.setFromObject(clone);
    const center = new Vector3();
    box.getCenter(center);
    clone.position.set(-center.x, -box.min.y, -center.z);

    clone.traverse((obj) => {
      const mesh = obj as Object3D & MeshMat;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material && typeof mesh.material.clone === "function") {
        mesh.material = mesh.material.clone() as NonNullable<MeshMat["material"]>;
      }
      if (mesh.material?.color) mesh.userData.baseColor = mesh.material.color.clone();
      if (mesh.material?.emissive) mesh.userData.baseEmissive = mesh.material.emissive.clone();
      if (mesh.material?.emissiveIntensity != null) {
        mesh.userData.baseEmissiveIntensity = mesh.material.emissiveIntensity;
      }
      if (mesh.material?.roughness != null) {
        mesh.userData.baseRoughness = mesh.material.roughness;
      }
    });
  }, [clone, height]);

  useLayoutEffect(() => {
    clone.traverse((obj) => {
      const mesh = obj as Object3D & MeshMat;
      if (!mesh.isMesh || !mesh.material) return;
      const { baseColor, baseEmissive, baseEmissiveIntensity, baseRoughness } = mesh.userData;

      if (baseColor && mesh.material.color) mesh.material.color.copy(baseColor);
      if (baseEmissive && mesh.material.emissive) mesh.material.emissive.copy(baseEmissive);
      if (baseEmissiveIntensity != null && mesh.material.emissiveIntensity != null) {
        mesh.material.emissiveIntensity = baseEmissiveIntensity;
      }
      if (baseRoughness != null && mesh.material.roughness != null) {
        mesh.material.roughness = baseRoughness;
      }

      if (destroyed) {
        if (mesh.material.color) mesh.material.color.multiplyScalar(0.35);
        if (mesh.material.emissive) mesh.material.emissive.set("#111111");
        if (mesh.material.emissiveIntensity != null) mesh.material.emissiveIntensity = 0.05;
        if (mesh.material.roughness != null) mesh.material.roughness = 0.85;
      } else if (mesh.material.emissiveIntensity != null && healthRatio < 0.45) {
        const base = baseEmissiveIntensity ?? 0.2;
        mesh.material.emissiveIntensity = base * (0.4 + healthRatio);
      }
    });
  }, [clone, destroyed, healthRatio]);

  const { actions, names } = useAnimations(animations, modelRef);

  useEffect(() => {
    if (!actions) return;
    // Fade out propre (évite l'arrêt brutal mid-air)
    Object.values(actions).forEach((a) => {
      if (a?.isRunning()) a.fadeOut(0.18);
    });

    const pick = (candidates: string[]) =>
      candidates.find((n) => names.includes(n) || actions[n]) ||
      names.find((n) => /sentinel|idle|stand|wait/i.test(n)) ||
      // Jamais Walk/Run comme idle (sinon marche sur place en permanence)
      names.find((n) => !/walk|run|collapse|hit|knock|fire|punch|sword|rifle|flip|dodge|flight|wing|boost/i.test(n)) ||
      names[0];

    const play = (name: string | undefined, opts?: { once?: boolean; fade?: number; scale?: number; freezeEnd?: boolean }) => {
      if (!name || !actions[name]) return false;
      const action = actions[name]!;
      action.reset();
      if (opts?.once) action.setLoop(LoopOnce, 1);
      action.fadeIn(opts?.fade ?? 0.15).play();
      action.setEffectiveTimeScale(opts?.scale ?? 1);
      if (opts?.freezeEnd) {
        action.clampWhenFinished = true;
      }
      return true;
    };

    if (destroyed) {
      // Joue la chute jusqu'au sol, puis fige (pas de pose « à mi-chute »)
      const collapse =
        pick(["Collapse", "Die", "HitChest"]) || names.find((n) => /collapse|die|death/i.test(n));
      if (collapse && actions[collapse]) {
        const action = actions[collapse]!;
        action.reset();
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        action.paused = false;
        action.fadeIn(0.12).play();
        action.setEffectiveTimeScale(1.05);
      }
      return;
    }

    // Rituel de soin : debout, bras en l'air (keyframe PunchCombo figé)
    if (castHold) {
      const clipName = pick(["PunchCombo", "SwordCombo", "BladeSalute", "Sentinel"]);
      if (clipName && actions[clipName]) {
        const action = actions[clipName]!;
        action.reset();
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        action.fadeIn(0.12).play();
        action.paused = true;
        // ~40% du combo = bras levés / avancés, encore debout
        const dur = action.getClip().duration;
        action.time = Math.min(dur * 0.42, dur * 0.9);
        return;
      }
    }

    if (attacking) {
      // Pas de Backflip / BoostJump / Knockback / KneelFire (genou)
      const preferred = attackClip ? [attackClip] : [];
      const attack = pick([
        ...preferred.filter((n) => !/kneel/i.test(n)),
        "PunchCombo",
        "SwordSlash",
        "SwordCombo",
        "RifleBurst",
        "WingDeploy",
        "BladeSalute",
      ]);
      if (play(attack, { once: true, fade: 0.1, scale: 1.05, freezeEnd: true })) return;
    }

    if (hitReact) {
      // HitChest léger seulement (Knockback = lift bizarre)
      if (play(pick(["HitChest", "HitHead"]), { once: true, fade: 0.08, scale: 1.1 })) return;
    }

    if (walking) {
      if (play(pick(["Walk", "Run"]), { fade: 0.2, scale: 1.1 })) return;
    }

    play(pick(asset.preferredClips), { fade: 0.22, scale: 0.85 });
  }, [actions, names, destroyed, attacking, walking, castHold, attackClip, attackNonce, hitReact, asset.preferredClips]);

  useFrame((_, dt) => {
    if (!root.current) return;
    const t = 1 - Math.exp(-moveLerp * dt);
    pos.current.x = MathUtils.lerp(pos.current.x, position[0], t);
    pos.current.y = MathUtils.lerp(pos.current.y, position[1], t);
    pos.current.z = MathUtils.lerp(pos.current.z, position[2], t);
    currentYaw.current = lerpAngle(currentYaw.current, targetYaw, t);

    bob.current =
      destroyed || lockGround || attacking || walking || castHold
        ? 0
        : Math.sin(performance.now() * 0.0012) * 0.008;
    root.current.position.set(pos.current.x, pos.current.y + bob.current, pos.current.z);
    root.current.rotation.set(rotation[0], currentYaw.current + rotation[1], rotation[2]);
  });

  return (
    <group ref={root} position={position}>
      <group ref={modelRef}>
        <primitive object={clone} />
      </group>
      {destroyed && <SmokePuffs />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.55, 0.62, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={destroyed ? 0.05 : attacking ? 0.9 : 0.55}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

function lerpAngle(a: number, b: number, t: number) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function SmokePuffs() {
  return (
    <group position={[0, 1.2, 0]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(i - 2) * 0.15, i * 0.08, (i % 2) * 0.1]}>
          <sphereGeometry args={[0.12 + i * 0.02, 10, 10]} />
          <meshStandardMaterial color="#64748b" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function MechPlaceholder({ position = [0, 0, 0], height = 2.35 }: Props) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <capsuleGeometry args={[0.35, height * 0.55, 6, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} wireframe />
      </mesh>
    </group>
  );
}

useGLTF.preload(MECH_ASSETS.tank.url);
useGLTF.preload(MECH_ASSETS.sniper.url);
useGLTF.preload(MECH_ASSETS.medic.url);
useGLTF.preload(MECH_ASSETS.assault.url);
useGLTF.preload(MECH_ASSETS.challenger.url);
