import express from "express";
import path from "node:path";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { runValidation, runBattle, compileProject, paths } from "./javaRunner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const PRIVATE = process.env.ARENA_PRIVATE || path.resolve(__dirname, "../../");
const WORK = process.env.ARENA_WORK || path.resolve(__dirname, "../../../work");

const app = express();
// Front + API même origine : pas de CORS global
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Robot Arena Control",
    season: "2147",
    java: "21",
    paths: paths(),
  });
});

app.get("/api/missions", async (_req, res) => {
  try {
    const catalogPath = path.join(PRIVATE, "missions", "catalog.json");
    const raw = await readFile(catalogPath, "utf8");
    res.type("json").send(raw);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get("/api/robots", async (_req, res) => {
  // Fiches de RÉFÉRENCE (cahier des charges) — pas un miroir live du code étudiant
  res.json({
    referenceOnly: true,
    notice:
      "Caractéristiques de référence du cahier des charges. Modifier Challenger.java ne met pas à jour cette fiche : validez via les tests et l'Arène.",
    robots: [
      {
        id: "ref-tank",
        className: "Tank",
        codename: "Atlas",
        role: "Cuirassé",
        maxHealth: 140,
        attackPower: 18,
        energy: 100,
        special: "Bouclier d'impact",
        file: "work/src/arena/robot/Tank.java",
        color: "#c2410c",
      },
      {
        id: "ref-sniper",
        className: "Sniper",
        codename: "Nova",
        role: "Précision",
        maxHealth: 90,
        attackPower: 28,
        energy: 100,
        special: "Tir critique",
        file: "work/src/arena/robot/Sniper.java",
        color: "#0284c7",
      },
      {
        id: "ref-medic",
        className: "Medic",
        codename: "Pulse",
        role: "Soutien",
        maxHealth: 110,
        attackPower: 12,
        energy: 120,
        special: "Nano-réparation",
        file: "work/src/arena/robot/Medic.java",
        color: "#059669",
      },
      {
        id: "ref-assault",
        className: "Assault",
        codename: "Seraph",
        role: "Assaut",
        maxHealth: 115,
        attackPower: 24,
        energy: 100,
        special: "Salve d'assaut",
        file: "work/src/arena/robot/Assault.java",
        color: "#a855f7",
      },
      {
        id: "ref-challenger",
        className: "Challenger",
        codename: "À définir",
        role: "Prototype binôme",
        maxHealth: null,
        attackPower: null,
        energy: null,
        special: "Votre conception",
        file: "work/src/arena/robot/Challenger.java",
        color: "#be123c",
      },
    ],
  });
});

app.post("/api/compile", async (_req, res) => {
  const result = await compileProject();
  if (result.buildDir) {
    // cleanup handled inside other runners; compile endpoint keeps dir briefly unused
    const { default: fs } = await import("node:fs/promises");
    await fs.rm(result.buildDir, { recursive: true, force: true }).catch(() => {});
  }
  res.json(result.compile);
});

app.post("/api/validate", async (req, res) => {
  const missionId = req.body?.missionId || "all";
  const result = await runValidation(missionId);
  res.json(result);
});

app.post("/api/battle", async (req, res) => {
  const scenarioId = req.body?.scenarioId || "diagnostic-energy";
  const result = await runBattle(scenarioId);
  res.json(result);
});

app.get("/api/work-tree", async (_req, res) => {
  async function walk(dir, prefix = "work") {
    const out = [];
    let entries = [];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const e of entries) {
      const rel = `${prefix}/${e.name}`;
      if (e.isDirectory()) {
        out.push({ path: rel, type: "dir" });
        out.push(...(await walk(path.join(dir, e.name), rel)));
      } else {
        const s = await stat(path.join(dir, e.name));
        out.push({ path: rel, type: "file", size: s.size });
      }
    }
    return out;
  }
  res.json({ tree: await walk(WORK) });
});

app.get("/api/docs/:name", async (req, res) => {
  const allowed = new Set(["PLAN_PROJET.md", "COMMANDES.md", "NOTIONS.md"]);
  if (!allowed.has(req.params.name)) {
    return res.status(404).json({ error: "Doc inconnue" });
  }
  try {
    const raw = await readFile(path.join(WORK, "docs", req.params.name), "utf8");
    res.type("text/markdown").send(raw);
  } catch {
    res.status(404).json({ error: "Fichier introuvable" });
  }
});

const clientDist =
  process.env.CLIENT_DIST || path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) {
      res.status(503).send("Client non construit. Relancez docker compose up --build.");
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Robot Arena Control listening on :${PORT}`);
  console.log(`WORK=${WORK}`);
  console.log(`PRIVATE=${PRIVATE}`);
});
