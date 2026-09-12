const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const args = process.argv.slice(2).reduce((acc, v, i, a) => {
  if (v.startsWith("--")) {
    const k = v.slice(2);
    acc[k] = a[i + 1] && !a[i + 1].startsWith("--") ? a[i + 1] : true;
  }
  return acc;
}, {});

const sessionId = args.session || "debug-session";
const outDir = args.outdir
  ? path.resolve(args.outdir)
  : path.resolve(process.cwd(), ".dbg");
const clean = Boolean(args.clean);
const idleSec = parseInt(String(args.idle ?? 0), 10) || 0;
const startPort = parseInt(String(args.port ?? 7777), 10) || 7777;
const remote = Boolean(args.remote);

fs.mkdirSync(outDir, { recursive: true });

const envFile = path.join(outDir, `${sessionId}.env`);
const logFile = path.join(
  outDir,
  `trae-debug-log-${sessionId}.ndjson`
);

if (clean && fs.existsSync(logFile)) {
  fs.truncateSync(logFile, 0);
  fs.writeFileSync(logFile, "", "utf8");
}
if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "", "utf8");
}

let logCount = 0;
try {
  const lines = fs
    .readFileSync(logFile, "utf8")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  logCount = lines.length;
} catch (_) {}

const startedAt = Date.now();
let lastActivityAt = startedAt;

function localIps() {
  const nets = os.networkInterfaces();
  const out = [];
  for (const k of Object.keys(nets)) {
    for (const n of nets[k] ?? []) {
      if (n.family === "IPv4" && !n.internal) out.push(n.address);
    }
  }
  return out;
}

function sendJSON(res, code, body) {
  const b = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(b);
}

function sendCorsOk(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

function appendLine(lineObj) {
  const line = JSON.stringify(lineObj) + "\n";
  fs.appendFileSync(logFile, line, "utf8");
  logCount += 1;
  lastActivityAt = Date.now();
}

function readLogs(lastN, hypId) {
  try {
    const raw = fs.readFileSync(logFile, "utf8");
    if (!raw.trim()) return [];
    let rows = raw.split("\n").filter((l) => l.trim().length > 0);
    if (hypId) {
      rows = rows.filter((r) => {
        try {
          const o = JSON.parse(r);
          return (
            String(o.hypothesisId || "").toLowerCase() ===
            String(hypId).toLowerCase()
          );
        } catch (_) {
          return false;
        }
      });
    }
    if (lastN > 0) rows = rows.slice(-lastN);
    return rows.map((r) => {
      try {
        return JSON.parse(r);
      } catch (_) {
        return { raw: r };
      }
    });
  } catch (e) {
    return [];
  }
}

function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "OPTIONS") return sendCorsOk(res);

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJSON(res, 200, {
      ok: true,
      sessionId,
      startedAt,
      uptimeMs: Date.now() - startedAt,
      logCount,
      logFile,
      envFile,
    });
  }

  if (req.method === "GET" && url.pathname === "/logs") {
    const lastN = parseInt(url.searchParams.get("last") || "0", 10) || 0;
    const hypId = url.searchParams.get("hypothesisId") || "";
    return sendJSON(res, 200, { ok: true, logs: readLogs(lastN, hypId) });
  }

  if (req.method === "DELETE" && url.pathname === "/logs") {
    fs.truncateSync(logFile, 0);
    logCount = 0;
    return sendJSON(res, 200, { ok: true, cleared: true });
  }

  if (req.method === "POST" && url.pathname === "/event") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      let obj;
      try {
        obj = body ? JSON.parse(body) : {};
      } catch (_) {
        obj = { rawBody: body };
      }
      obj = {
        ts: Date.now(),
        sessionId: obj.sessionId || sessionId,
        runId: obj.runId || "unknown",
        hypothesisId: obj.hypothesisId || "?",
        ...obj,
      };
      appendLine(obj);
      return sendJSON(res, 200, { ok: true, received: true });
    });
    return;
  }

  return sendJSON(res, 404, { ok: false, error: "not found" });
}

let port = startPort;
let bound = false;
let server = http.createServer(handler);
const host = remote ? "0.0.0.0" : "127.0.0.1";

function tryBind(p) {
  server.listen(p, host, () => {
    bound = true;
    const serverUrl = `http://127.0.0.1:${p}/event`;
    fs.writeFileSync(
      envFile,
      `DEBUG_SERVER_URL=${serverUrl}\nDEBUG_SESSION_ID=${sessionId}\n`
    );
    console.log(`[TRAE-debug-server] Ready on http://127.0.0.1:${p}`);
    console.log(`[TRAE-debug-server] Session: ${sessionId}`);
    console.log(`[TRAE-debug-server] Host: ${host}`);
    if (remote) {
      console.log(`[TRAE-debug-server] Remote IPs: ${localIps().join(", ")}`);
    }
    console.log(`[TRAE-debug-server] Log file: ${logFile}`);
    console.log(`[TRAE-debug-server] Env file: ${envFile}`);
    console.log(
      `[TRAE-debug-server] Idle timeout: ${
        idleSec > 0 ? `${idleSec}s` : "disabled"
      }`
    );
    console.log(`[TRAE-debug-server] Current log count: ${logCount}`);
  });
  server.on("error", (err) => {
    if ((err.code === "EADDRINUSE" || err.code === "EACCES") && p < startPort + 10 && !bound) {
      server.close(() => {
        server = http.createServer(handler);
        tryBind(p + 1);
      });
    } else {
      console.error("[TRAE-debug-server] Fatal:", err);
      process.exit(1);
    }
  });
}
tryBind(port);

if (idleSec > 0) {
  const tick = setInterval(() => {
    const idle = Math.floor((Date.now() - lastActivityAt) / 1000);
    if (idle >= idleSec && logCount > 0) {
      console.log(
        `[TRAE-debug-server] Idle for ${idle}s, shutting down cleanly.`
      );
      clearInterval(tick);
      try {
        server.close();
      } catch (_) {}
      process.exit(0);
    }
  }, 10 * 1000);
}
