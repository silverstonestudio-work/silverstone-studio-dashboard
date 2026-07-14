// Resilient dev runner.
//
// Why this exists: on Windows, stopping `next dev` (or a crash) can leave a
// zombie Node process still holding the port. After a few cycles the port
// drifts (3000 -> 3001 -> 3002 ...) and the browser tab pointed at the old
// port hits a dead server — so you keep having to re-run the command.
//
// This runner fixes that: it frees the port before starting, pins Next to a
// fixed port so the URL never changes, and automatically restarts Next if it
// ever exits unexpectedly. Run `npm run dev` once and leave it.

import { spawn, execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const PORT = process.env.PORT || "3000";
const isWin = process.platform === "win32";
const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");

let child = null;
let shuttingDown = false;
let restarts = 0;

/** Kill whatever is currently listening on the port (a stale zombie server). */
function freePort(port) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano | findstr :${port}`, {
        stdio: ["ignore", "pipe", "ignore"],
      }).toString();
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        const m = line.trim().match(/LISTENING\s+(\d+)$/);
        if (m) pids.add(m[1]);
      }
      for (const pid of pids) {
        if (pid === String(process.pid)) continue;
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`[dev] Freed port ${port} (killed stale PID ${pid}).`);
        } catch {
          /* already gone */
        }
      }
    } else {
      execSync(`lsof -ti tcp:${port} | xargs -r kill -9`, { stdio: "ignore" });
    }
  } catch {
    /* nothing was listening — that's the normal, healthy case */
  }
}

function start() {
  freePort(PORT);
  child = spawn(process.execPath, [nextBin, "dev", "-p", PORT], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    restarts += 1;
    console.log(
      `\n[dev] Next dev exited (code ${code ?? "?"}, signal ${signal ?? "none"}). ` +
        `Restarting on port ${PORT}… (restart #${restarts})\n`
    );
    setTimeout(start, 800);
  });

  child.on("error", (err) => {
    console.error("[dev] Failed to launch next:", err.message);
  });
}

// Clean shutdown: kill the child and don't respawn when the user stops us.
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    shuttingDown = true;
    if (child) child.kill();
    process.exit(0);
  });
}

start();
