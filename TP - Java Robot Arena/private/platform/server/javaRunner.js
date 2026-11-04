import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const WORK = process.env.ARENA_WORK || "/arena/work";
const PRIVATE = process.env.ARENA_PRIVATE || "/arena/private";

async function walkJava(dir, acc = []) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkJava(full, acc);
    } else if (entry.isFile() && entry.name.endsWith(".java")) {
      acc.push(full);
    }
  }
  return acc;
}

async function collectJavaFiles(roots) {
  const files = [];
  for (const root of roots) {
    await walkJava(root, files);
  }
  return files;
}

const MAX_OUTPUT = 512_000;
/** Exécution java (tests / combat) : court pour un PLD réactif. */
const RUN_TIMEOUT_MS = 10_000;
/** javac peut être un peu plus long au premier froid. */
const COMPILE_TIMEOUT_MS = 30_000;

function runCommand(command, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? RUN_TIMEOUT_MS;
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...(options.env || {}) },
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const finish = (code, extraErr = "") => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (extraErr) stderr = (stderr + "\n" + extraErr).trim();
      if (timedOut) {
        stderr = (stderr + `\n[timeout] ${command} interrompu après ${timeoutMs}ms`).trim();
      }
      resolve({
        code: timedOut ? 124 : code ?? 1,
        stdout: stdout.slice(0, MAX_OUTPUT),
        stderr: stderr.slice(0, MAX_OUTPUT),
        timedOut,
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      if (stdout.length < MAX_OUTPUT) stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      if (stderr.length < MAX_OUTPUT) stderr += d.toString();
    });
    child.on("error", (err) => {
      finish(1, err?.message || String(err));
    });
    child.on("close", (code) => {
      finish(code ?? 1);
    });
  });
}

export async function compileProject() {
  const buildDir = await mkdtemp(path.join(tmpdir(), "arena-build-"));
  const sources = await collectJavaFiles([
    path.join(WORK, "src"),
    path.join(PRIVATE, "engine"),
    path.join(PRIVATE, "tests"),
  ]);

  if (sources.length === 0) {
    return {
      ok: false,
      buildDir,
      compile: {
        ok: false,
        message: "Aucun fichier .java trouvé dans work/src",
        diagnostics: [],
      },
    };
  }

  const listFile = path.join(buildDir, "sources.txt");
  await writeFile(listFile, sources.join("\n"), "utf8");

  const result = await runCommand(
    "javac",
    ["--release", "21", "-encoding", "UTF-8", "-d", buildDir, `@${listFile}`],
    { timeoutMs: COMPILE_TIMEOUT_MS }
  );

  const diagnostics = parseJavac(result.stderr || result.stdout);

  return {
    ok: result.code === 0,
    buildDir,
    compile: {
      ok: result.code === 0,
      message:
        result.code === 0
          ? `Compilation réussie (${sources.length} fichiers)`
          : "Échec de compilation",
      raw: (result.stderr || result.stdout || "").trim(),
      diagnostics,
    },
  };
}

function parseJavac(output) {
  const lines = (output || "").split(/\r?\n/);
  const diagnostics = [];
  const re = /^(.+\.java):(\d+):\s*(error|warning):\s*(.*)$/;
  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      diagnostics.push({
        file: m[1],
        line: Number(m[2]),
        severity: m[3],
        message: m[4],
      });
    }
  }
  return diagnostics;
}

export async function runValidation(missionId = "all") {
  const compiled = await compileProject();
  if (!compiled.ok) {
    await safeRm(compiled.buildDir);
    return {
      ok: false,
      compile: compiled.compile,
      passed: 0,
      failed: 0,
      results: [],
    };
  }

  const run = await runCommand(
    "java",
    ["-cp", compiled.buildDir, "arena.platform.ValidationRunner", missionId || "all"],
    { timeoutMs: RUN_TIMEOUT_MS }
  );

  await safeRm(compiled.buildDir);

  if (run.code !== 0 && !run.stdout.trim()) {
    return {
      ok: false,
      compile: compiled.compile,
      passed: 0,
      failed: 1,
      results: [
        {
          id: missionId,
          title: "Validation",
          status: "failed",
          message: (run.stderr || "Échec d'exécution").trim(),
        },
      ],
      raw: run.stderr,
    };
  }

  try {
    const json = JSON.parse(run.stdout.trim().split("\n").filter(Boolean).at(-1));
    return {
      ok: json.failed === 0,
      compile: compiled.compile,
      ...json,
    };
  } catch {
    return {
      ok: false,
      compile: compiled.compile,
      passed: 0,
      failed: 1,
      results: [
        {
          id: "runner",
          title: "ValidationRunner",
          status: "failed",
          message: "Sortie JSON invalide",
        },
      ],
      raw: run.stdout + "\n" + run.stderr,
    };
  }
}

export async function runBattle(scenarioId = "diagnostic-energy") {
  const compiled = await compileProject();
  if (!compiled.ok) {
    await safeRm(compiled.buildDir);
    return {
      ok: false,
      compile: compiled.compile,
      events: [],
      error: "Compilation échouée — combat annulé",
    };
  }

  const run = await runCommand(
    "java",
    ["-cp", compiled.buildDir, "arena.platform.BattleRunner", scenarioId],
    { timeoutMs: RUN_TIMEOUT_MS }
  );

  await safeRm(compiled.buildDir);

  try {
    const json = JSON.parse(run.stdout.trim().split("\n").filter(Boolean).at(-1));
    return { compile: compiled.compile, ...json };
  } catch {
    return {
      ok: false,
      compile: compiled.compile,
      events: [],
      error: (run.stderr || run.stdout || "Sortie combat invalide").trim(),
    };
  }
}

async function safeRm(dir) {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

export function paths() {
  return { work: WORK, privateRoot: PRIVATE };
}
