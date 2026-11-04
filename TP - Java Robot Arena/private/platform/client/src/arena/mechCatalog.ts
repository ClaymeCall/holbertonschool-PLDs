/** Mapping classe Java → asset FORGE (CC0). https://github.com/RamonLinares/atlas-09 */

export type MechRole = "tank" | "sniper" | "medic" | "assault" | "challenger";

export const MECH_ASSETS: Record<
  MechRole,
  {
    url: string;
    label: string;
    frame: string;
    preferredClips: string[];
    blurb: string;
    systems: string[];
    loadout: string[];
  }
> = {
  tank: {
    url: "/models/mechs/atlas-09.glb",
    label: "ATLAS / 09",
    frame: "Châssis d'assaut lourd",
    preferredClips: ["Sentinel", "Idle", "idle"],
    blurb:
      "Blindage épais, absorption passive et canon d'impact. Conçu pour tenir la ligne pendant que l'équipe se repositionne.",
    systems: ["Bouclier passif", "Servos haute charge", "Réacteur stabilisé"],
    loadout: ["Canon d'impact", "Émetteur de bouclier", "Plaques latérales"],
  },
  sniper: {
    url: "/models/mechs/vanguard-07.glb",
    label: "VANGUARD / 07",
    frame: "Châssis militaire longue portée",
    preferredClips: ["Sentinel", "Idle", "idle"],
    blurb:
      "Cadre allégé, railgun de précision et télémétrie optique. Fragile au corps à corps, dévastateur à distance.",
    systems: ["Optique multi-couches", "Rail accélérateur", "Stabilisateur gyro"],
    loadout: ["Fusil rail", "Viseur critique", "Batterie compacte"],
  },
  medic: {
    url: "/models/mechs/aether-02.glb",
    label: "AETHER / 02",
    frame: "Châssis soutien / récupération",
    preferredClips: ["Sentinel", "Idle", "idle"],
    blurb:
      "Réserves d'énergie élevées et nano-réparation. Peu de dégâts bruts, mais peut retourner un duel.",
    systems: ["Noyau nano", "Packs médicaux", "Liaison d'équipe"],
    loadout: ["Projecteur de soin", "Pince de soutien", "Réservoir EN+"],
  },
  assault: {
    url: "/models/mechs/seraph-03.glb",
    label: "SERAPH / 03",
    frame: "Châssis d'assaut ailé",
    preferredClips: ["Sentinel", "Idle", "idle"],
    blurb:
      "Frame offensive à haute mobilité. Canon lourd au bras droit et verniers dorsaux. Bon contrepoint au Tank et au Sniper.",
    systems: ["Verniers dorsaux", "Canon lourd", "Stabilisateur aérien"],
    loadout: ["Salve d'assaut", "Propulseurs", "Armure semi-légère"],
  },
  challenger: {
    url: "/models/mechs/ronin-04.glb",
    label: "RONIN / 04",
    frame: "Prototype challenger binôme",
    preferredClips: ["Sentinel", "Idle", "idle"],
    blurb:
      "Slot libre pour votre conception. Respectez le budget de caractéristiques et branchez une capacité via polymorphisme.",
    systems: ["À définir", "Interface SpecialAbility", "Homologation m6"],
    loadout: ["Capacité custom", "Stats budget ≤ 280", "Sans toucher private/"],
  },
};

export function resolveMechRole(variant?: string): MechRole {
  const v = (variant || "tank").toLowerCase();
  if (v.includes("sniper")) return "sniper";
  if (v.includes("medic")) return "medic";
  if (v.includes("assault") || v.includes("seraph")) return "assault";
  if (v.includes("challenger") || v.includes("custom")) return "challenger";
  return "tank";
}
