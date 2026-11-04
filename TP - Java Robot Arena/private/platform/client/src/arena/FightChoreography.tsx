import { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import type { CombatEvent, RobotSnapshot } from "../types";
import { MechRobot } from "./MechRobot";
import { ImpactFX } from "./ImpactFX";
import { HealFX } from "./HealFX";
import { resolveMechRole, type MechRole } from "./mechCatalog";

const COLORS: Record<string, string> = {
  Tank: "#c2410c",
  Sniper: "#0284c7",
  Medic: "#059669",
  Assault: "#a855f7",
  Challenger: "#be123c",
};

const LEFT_HOME: [number, number, number] = [-2.1, 0, 0.25];
const RIGHT_HOME: [number, number, number] = [2.1, 0, 0.25];
const LEFT_CONTACT: [number, number, number] = [-0.42, 0, 0.06];
const RIGHT_CONTACT: [number, number, number] = [0.42, 0, 0.06];
/** Centre arène pour le rituel de soin. */
const CENTER: [number, number, number] = [0, 0, 0.1];
const STAGGER = 0.18;

const YAW_CAMERA = 0;
const YAW_LEFT_OUT = Math.PI / 2;
const YAW_RIGHT_OUT = -Math.PI / 2;
const YAW_LEFT_BACK = -Math.PI / 2;
const YAW_RIGHT_BACK = Math.PI / 2;

const ATTACK_POOLS: Record<MechRole, string[]> = {
  tank: ["PunchCombo", "PunchCombo", "PunchCombo"],
  sniper: ["RifleBurst", "RifleBurst", "KneelFire"],
  medic: ["PunchCombo", "PunchCombo", "PunchCombo"],
  assault: ["KneelFire", "WingDeploy", "KneelFire"],
  challenger: ["SwordSlash", "SwordCombo", "PunchCombo", "SwordSlash"],
};

type Phase =
  | "camera"
  | "turn"
  | "ready"
  | "approach"
  | "strike"
  | "recover"
  | "about_face"
  | "return"
  | "settle";

type Props = {
  left?: RobotSnapshot;
  right?: RobotSnapshot;
  current?: CombatEvent | null;
  boutToken?: number;
};

function isSameFighter(eventId: string | undefined, robot: RobotSnapshot) {
  if (!eventId || eventId === "null") return false;
  return eventId === robot.id || eventId === robot.name;
}

function pickAttackClip(type: string, turn: number) {
  const role = resolveMechRole(type);
  const pool = ATTACK_POOLS[role];
  return pool[Math.abs(turn) % pool.length];
}

export function FightChoreography({ left, right, current, boutToken = 0 }: Props) {
  const [phase, setPhase] = useState<Phase>("camera");
  const [showImpact, setShowImpact] = useState(false);
  const [showHeal, setShowHeal] = useState(false);
  const [stagger, setStagger] = useState(false);
  const [healMode, setHealMode] = useState(false);
  const [attackClip, setAttackClip] = useState<string | undefined>();
  const [attackNonce, setAttackNonce] = useState(0);
  /** Retarde le collapse : le robot reste debout pour encaisser le coup fatal. */
  const [allowFall, setAllowFall] = useState(false);
  const [koBanner, setKoBanner] = useState<{ side: "left" | "right"; name: string } | null>(null);
  /** Invalide les timeouts d'intro caméra si un coup démarre avant la fin. */
  const introGen = useRef(0);

  const eventKey = current
    ? `${current.turn}|${current.type}|${current.actorId}|${current.targetId}|${current.damage}|${current.healing}`
    : "idle";

  const leftIsActor = !!current && !!left && isSameFighter(current.actorId, left);
  const rightIsActor = !!current && !!right && isSameFighter(current.actorId, right);
  const leftIsTarget = !!current && !!left && isSameFighter(current.targetId, left);
  const rightIsTarget = !!current && !!right && isSameFighter(current.targetId, right);

  const killingBlow =
    !!current &&
    current.type !== "ERROR" &&
    current.damage > 0 &&
    current.targetHealthAfter <= 0;

  useEffect(() => {
    const gen = ++introGen.current;
    setPhase("camera");
    setShowImpact(false);
    setShowHeal(false);
    setStagger(false);
    setHealMode(false);
    setAttackClip(undefined);
    setAllowFall(false);
    setKoBanner(null);
    const t1 = window.setTimeout(() => {
      if (introGen.current === gen) setPhase("turn");
    }, 850);
    const t2 = window.setTimeout(() => {
      if (introGen.current === gen) setPhase("ready");
    }, 1600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [boutToken]);

  useEffect(() => {
    if (!current || current.type === "ERROR" || current.type === "RECHARGE" || current.type === "MATCH_START") {
      return;
    }

    // Annule l'intro caméra pour ne pas écraser approach/strike
    introGen.current += 1;

    const isSupport = current.type === "SPECIAL" || (current.healing > 0 && current.damage <= 0);
    setHealMode(isSupport);
    setAllowFall(false);
    setKoBanner(null);

    const actor = leftIsActor ? left : rightIsActor ? right : left;
    // KneelFire = geste bras levés / canalisation (meilleur clip dispo sur Aether)
    setAttackClip(isSupport ? "PunchCombo" : actor ? pickAttackClip(actor.type, current.turn) : "PunchCombo");
    setAttackNonce((n) => n + 1);

    let cancelled = false;
    const run = async () => {
      setShowImpact(false);
      setShowHeal(false);
      setStagger(false);
      setPhase("ready");
      await wait(200);
      if (cancelled) return;

      if (isSupport) {
        // Marche au centre
        setPhase("approach");
        await wait(1100);
        if (cancelled) return;

        // Bras levés + éclairs de soin
        setPhase("strike");
        await wait(350);
        if (cancelled) return;
        setShowHeal(true);
        await wait(1600);
        if (cancelled) return;
        setShowHeal(false);

        setPhase("recover");
        await wait(300);
        if (cancelled) return;

        setPhase("about_face");
        await wait(380);
        if (cancelled) return;

        setPhase("return");
        await wait(1000);
        if (cancelled) return;

        setPhase("settle");
        await wait(350);
        if (cancelled) return;
        setPhase("ready");
        return;
      }

      setPhase("approach");
      await wait(1050);
      if (cancelled) return;

      setPhase("strike");
      await wait(320);
      if (cancelled) return;
      setShowImpact(current.damage > 0);
      setStagger(current.damage > 0);
      await wait(480);
      if (cancelled) return;
      setShowImpact(false);

      // Coup fatal : message KO + chute après l'impact
      if (killingBlow) {
        const side: "left" | "right" = leftIsTarget ? "left" : "right";
        const name = (leftIsTarget ? left?.name : right?.name) || current.targetName || "Robot";
        setAllowFall(true);
        setKoBanner({ side, name });
        setPhase("recover");
        await wait(1100);
        if (cancelled) return;
        setStagger(false);

        setPhase("about_face");
        await wait(400);
        if (cancelled) return;

        setPhase("return");
        await wait(1000);
        if (cancelled) return;

        setPhase("settle");
        await wait(380);
        if (cancelled) return;
        setPhase("ready");
        return;
      }

      setPhase("recover");
      await wait(280);
      if (cancelled) return;
      setStagger(false);

      setPhase("about_face");
      await wait(400);
      if (cancelled) return;

      setPhase("return");
      await wait(1000);
      if (cancelled) return;

      setPhase("settle");
      await wait(380);
      if (cancelled) return;
      setPhase("ready");
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventKey, current]);

  // Pendant le coup fatal : reste debout jusqu'à allowFall, puis collapse
  const leftDying = killingBlow && leftIsTarget;
  const rightDying = killingBlow && rightIsTarget;
  const leftDown =
    (!!left?.destroyed || (left?.health ?? 1) <= 0) && (!leftDying || allowFall);
  const rightDown =
    (!!right?.destroyed || (right?.health ?? 1) <= 0) && (!rightDying || allowFall);

  const leftPose = useMemo(
    () =>
      poseFor("left", phase, leftIsActor, leftIsTarget, stagger, healMode, leftDown),
    [phase, leftIsActor, leftIsTarget, stagger, healMode, leftDown]
  );
  const rightPose = useMemo(
    () =>
      poseFor("right", phase, rightIsActor, rightIsTarget, stagger, healMode, rightDown),
    [phase, rightIsActor, rightIsTarget, stagger, healMode, rightDown]
  );

  const walkingLeft = (phase === "approach" || phase === "return") && leftIsActor;
  const walkingRight = (phase === "approach" || phase === "return") && rightIsActor;
  const power = current ? Math.min(1, 0.45 + current.damage / 32) : 0.7;

  const targetPose = leftIsTarget ? leftPose : rightPose;
  const actorPose = leftIsActor ? leftPose : rightPose;
  const impactPos: [number, number, number] = [
    targetPose.position[0] + (leftIsTarget ? 0.42 : -0.42),
    1.3,
    targetPose.position[2] + 0.06,
  ];
  const impactDir: [number, number, number] = leftIsTarget
    ? [0.85, 0.65, 0.4]
    : [-0.85, 0.65, 0.4];

  const koPos: [number, number, number] | null = koBanner
    ? [
        (koBanner.side === "left" ? leftPose : rightPose).position[0],
        2.35,
        (koBanner.side === "left" ? leftPose : rightPose).position[2],
      ]
    : null;

  return (
    <group>
      {left && (
        <MechRobot
          key={`left-${left.id}-${left.type}`}
          position={leftPose.position}
          yaw={leftPose.yaw}
          color={COLORS[left.type] || "#94a3b8"}
          variant={left.type.toLowerCase()}
          healthRatio={left.maxHealth ? left.health / left.maxHealth : 1}
          destroyed={leftDown}
          walking={walkingLeft}
          attacking={!healMode && phase === "strike" && leftIsActor}
          castHold={healMode && (phase === "strike" || phase === "recover") && leftIsActor}
          attackClip={leftIsActor ? attackClip : undefined}
          attackNonce={attackNonce}
          hitReact={false}
          height={2.45}
          lockGround
          moveLerp={
            phase === "approach" || phase === "return"
              ? 3.0
              : phase === "about_face" || phase === "settle" || phase === "recover"
                ? 5.5
                : 7
          }
        />
      )}
      {right && (
        <MechRobot
          key={`right-${right.id}-${right.type}`}
          position={rightPose.position}
          yaw={rightPose.yaw}
          color={COLORS[right.type] || "#94a3b8"}
          variant={right.type.toLowerCase()}
          healthRatio={right.maxHealth ? right.health / right.maxHealth : 1}
          destroyed={rightDown}
          walking={walkingRight}
          attacking={!healMode && phase === "strike" && rightIsActor}
          castHold={healMode && (phase === "strike" || phase === "recover") && rightIsActor}
          attackClip={rightIsActor ? attackClip : undefined}
          attackNonce={attackNonce}
          hitReact={false}
          height={2.45}
          lockGround
          moveLerp={
            phase === "approach" || phase === "return"
              ? 3.0
              : phase === "about_face" || phase === "settle" || phase === "recover"
                ? 5.5
                : 7
          }
        />
      )}

      {showImpact && current && current.damage > 0 && (
        <ImpactFX key={`hit-${eventKey}`} position={impactPos} direction={impactDir} power={power} kind="hit" />
      )}

      {showHeal && (
        <HealFX
          key={`heal-${eventKey}`}
          from={[actorPose.position[0], actorPose.position[1], actorPose.position[2]]}
          to={[targetPose.position[0], targetPose.position[1], targetPose.position[2]]}
        />
      )}

      {koBanner && koPos && (
        <Html position={koPos} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 2,
              border: "1px solid rgba(239,68,68,0.65)",
              background: "rgba(0,0,0,0.72)",
              color: "#fca5a5",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxShadow: "0 0 18px rgba(239,68,68,0.35)",
            }}
          >
            KO · {koBanner.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function poseFor(
  side: "left" | "right",
  phase: Phase,
  isActor: boolean,
  isTarget: boolean,
  stagger: boolean,
  healMode: boolean,
  ko: boolean
): { position: [number, number, number]; yaw: number } {
  const home = side === "left" ? LEFT_HOME : RIGHT_HOME;
  const contact = side === "left" ? LEFT_CONTACT : RIGHT_CONTACT;
  const faceOut = side === "left" ? YAW_LEFT_OUT : YAW_RIGHT_OUT;
  const faceBack = side === "left" ? YAW_LEFT_BACK : YAW_RIGHT_BACK;
  const homeStagger: [number, number, number] = [
    home[0] + (side === "left" ? -STAGGER : STAGGER),
    home[1],
    home[2],
  ];

  if (phase === "camera") return { position: home, yaw: YAW_CAMERA };
  if (phase === "turn" || phase === "ready" || phase === "settle") {
    return { position: home, yaw: faceOut };
  }
  if (ko) return { position: home, yaw: faceOut };

  if (isActor) {
    if (healMode) {
      // Au centre, face à l'allié (pas à la caméra), debout
      if (phase === "approach" || phase === "strike" || phase === "recover") {
        return { position: CENTER, yaw: faceOut };
      }
      if (phase === "about_face") {
        return { position: CENTER, yaw: faceBack };
      }
      if (phase === "return") {
        return { position: home, yaw: faceBack };
      }
    }

    if (phase === "approach" || phase === "strike" || phase === "recover") {
      return { position: contact, yaw: faceOut };
    }
    if (phase === "about_face") {
      return { position: contact, yaw: faceBack };
    }
    if (phase === "return") {
      return { position: home, yaw: faceBack };
    }
  }

  if (isTarget && stagger && (phase === "strike" || phase === "recover")) {
    return { position: homeStagger, yaw: faceOut };
  }

  return { position: home, yaw: faceOut };
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
