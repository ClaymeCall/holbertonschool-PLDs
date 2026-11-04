import type {
  BattleResponse,
  MissionCatalog,
  RobotCard,
  ValidateResponse,
} from "./types";

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} sur ${url}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => json<{ ok: boolean; season: string }>("/api/health"),
  missions: () => json<MissionCatalog>("/api/missions"),
  robots: () =>
    json<{ robots: RobotCard[]; notice?: string; referenceOnly?: boolean }>("/api/robots"),
  validate: (missionId = "all") =>
    json<ValidateResponse>("/api/validate", {
      method: "POST",
      body: JSON.stringify({ missionId }),
    }),
  battle: (scenarioId: string) =>
    json<BattleResponse>("/api/battle", {
      method: "POST",
      body: JSON.stringify({ scenarioId }),
    }),
  docs: async (name: string) => {
    const res = await fetch(`/api/docs/${name}`);
    if (!res.ok) throw new Error("Doc introuvable");
    return res.text();
  },
};
