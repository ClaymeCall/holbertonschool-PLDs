export type MissionFile = { path: string; role: string };

export type Mission = {
  id: string;
  order: number;
  code: string;
  title: string;
  severity: string;
  statusLabel: string;
  /** Pourquoi cette mission existe (contexte atelier). */
  contexte?: string;
  /** Bugs / symptômes concrets observés. */
  symptomes?: string[];
  /** Ce que l'étudiant doit accomplir, en une phrase. */
  objectif?: string;
  signalement: string;
  reproduire: string;
  attendu: string[];
  files: MissionFile[];
  constraints: string[];
  validation: string;
  hints: string[];
  notions: string[];
};

export type MissionCatalog = {
  season: string;
  facility: string;
  missions: Mission[];
};

export type TestResult = {
  id: string;
  title: string;
  status: "passed" | "failed";
  durationMs?: number;
  message: string;
};

export type ValidateResponse = {
  ok: boolean;
  compile?: {
    ok: boolean;
    message: string;
    raw?: string;
    diagnostics?: Array<{
      file: string;
      line: number;
      severity: string;
      message: string;
    }>;
  };
  passed: number;
  failed: number;
  results: TestResult[];
  raw?: string;
};

export type CombatEvent = {
  turn: number;
  type: string;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  damage: number;
  healing: number;
  energySpent: number;
  actorHealthAfter: number;
  targetHealthAfter: number;
  actorEnergyAfter: number;
  message: string;
};

export type RobotSnapshot = {
  id: string;
  name: string;
  type: string;
  health: number;
  maxHealth: number;
  energy: number;
  attackPower: number;
  destroyed: boolean;
};

export type RankingRow = {
  rank: number;
  name: string;
  type: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
};

export type BattleResponse = {
  ok: boolean;
  scenario?: string;
  winner?: string;
  turns?: number;
  /** État initial des robots (replay HP/EN). */
  robots?: RobotSnapshot[];
  events: CombatEvent[];
  ranking?: RankingRow[];
  error?: string;
  compile?: ValidateResponse["compile"];
};

export type RobotCard = {
  id: string;
  className: string;
  codename: string;
  role: string;
  maxHealth: number | null;
  attackPower: number | null;
  energy: number | null;
  special: string;
  file: string;
  color: string;
};

export type ViewId =
  | "control"
  | "workshop"
  | "missions"
  | "tests"
  | "arena"
  | "docs";
