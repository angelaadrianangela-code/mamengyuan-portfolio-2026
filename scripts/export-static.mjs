import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";

const clientDir = new URL("../dist/client/", import.meta.url);
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("static-export", `${process.pid}-${Date.now()}`);

const { default: worker } = await import(workerUrl.href);

const response = await worker.fetch(
  new Request("https://mamengyuan-portfolio-2026.pages.dev/", {
    headers: { accept: "text/html" },
  }),
  {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  },
  {
    waitUntil() {},
    passThroughOnException() {},
  },
);

if (!response.ok) {
  throw new Error(`Static export failed with HTTP ${response.status}`);
}

const html = await response.text();

await mkdir(clientDir, { recursive: true });
await writeFile(new URL("index.html", clientDir), html);
await copyFile(new URL("index.html", clientDir), new URL("404.html", clientDir));
await rm(new URL("../.wrangler/deploy/config.json", import.meta.url), { force: true });
await rm(new URL("../dist/server/wrangler.json", import.meta.url), { force: true });

console.log("Static homepage exported to dist/client/index.html");
