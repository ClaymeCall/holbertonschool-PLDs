import { useMemo } from "react";

export function useMechMaterials(
  accent: string,
  destroyed: boolean,
  healthRatio: number
) {
  return useMemo(() => {
    const dead = destroyed;
    return {
      armor: {
        color: dead ? "#3f4550" : "#6b7280",
        metalness: 0.92,
        roughness: dead ? 0.55 : 0.28,
      },
      darkArmor: {
        color: dead ? "#2a2e35" : "#1f242c",
        metalness: 0.88,
        roughness: 0.38,
      },
      accentArmor: {
        color: dead ? "#4b5563" : accent,
        metalness: 0.85,
        roughness: 0.32,
        emissive: dead ? "#000000" : accent,
        emissiveIntensity: dead ? 0 : 0.12 * Math.max(0.2, healthRatio),
      },
      steel: {
        color: dead ? "#5b6470" : "#9aa3af",
        metalness: 0.95,
        roughness: 0.22,
      },
      hydraulic: {
        color: "#111827",
        metalness: 0.7,
        roughness: 0.45,
      },
      optic: {
        color: dead ? "#450a0a" : "#67e8f9",
        emissive: dead ? "#7f1d1d" : "#22d3ee",
        emissiveIntensity: dead ? 0.15 : 1.4,
        metalness: 0.2,
        roughness: 0.15,
      },
      warning: {
        color: dead ? "#44403c" : "#f97316",
        emissive: dead ? "#000" : "#ea580c",
        emissiveIntensity: dead ? 0 : 0.55,
        metalness: 0.4,
        roughness: 0.4,
      },
      glass: {
        color: "#0ea5e9",
        transparent: true,
        opacity: 0.35,
        metalness: 0.1,
        roughness: 0.05,
        emissive: "#0284c7",
        emissiveIntensity: dead ? 0 : 0.3,
      },
    } as const;
  }, [accent, destroyed, healthRatio]);
}
