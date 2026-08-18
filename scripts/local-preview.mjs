import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = path.join(root, "dist", "client");
const vinextCli = path.join(root, "node_modules", "vinext", "dist", "cli.js");
const publicPort = Number(process.env.PORT ?? 3000);
const upstreamPort = Number(process.env.VINEXT_UPSTREAM_PORT ?? publicPort + 1);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
]);

const upstream = spawn(
  process.execPath,
  [vinextCli, "start", "--port", String(upstreamPort)],
  { cwd: root, stdio: "inherit", windowsHide: true },
);

function resolveClientFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  if (decoded === "/" || decoded.startsWith("/.vite/")) return null;
  const candidate = path.resolve(clientRoot, `.${decoded}`);
  const relative = path.relative(clientRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return candidate;
}

async function serveStatic(req, res, pathname) {
  const file = resolveClientFile(pathname);
  if (!file) return false;

  let info;
  try {
    info = await stat(file);
  } catch {
    return false;
  }
  if (!info.isFile()) return false;

  const extension = path.extname(file).toLowerCase();
  res.writeHead(200, {
    "Content-Type": contentTypes.get(extension) ?? "application/octet-stream",
    "Content-Length": String(info.size),
    "Cache-Control": pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600",
  });

  if (req.method === "HEAD") {
    res.end();
  } else {
    createReadStream(file).pipe(res);
  }
  return true;
}

function proxyToVinext(req, res) {
  const proxy = httpRequest(
    {
      hostname: "127.0.0.1",
      port: upstreamPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${upstreamPort}` },
    },
    (upstreamResponse) => {
      res.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(res);
    },
  );

  proxy.on("error", () => {
    if (!res.headersSent) res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Local preview server is starting. Please refresh in a moment.");
  });
  req.pipe(proxy);
}

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
  if (await serveStatic(req, res, pathname)) return;
  proxyToVinext(req, res);
});

server.listen(publicPort, "0.0.0.0", () => {
  console.log(`\n  Local portfolio preview: http://127.0.0.1:${publicPort}\n`);
});

function shutdown() {
  server.close();
  if (!upstream.killed) upstream.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
upstream.on("exit", (code) => {
  if (code && code !== 0) process.exitCode = code;
});
