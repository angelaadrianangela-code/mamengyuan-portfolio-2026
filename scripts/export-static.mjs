import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";

const clientDir = new URL("../dist/client/", import.meta.url);
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("static-export", `${process.pid}-${Date.now()}`);

const { default: worker } = await import(workerUrl.href);

const assetBinding = {
  fetch: async () => new Response("Not found", { status: 404 }),
};

const videoSlugs = [
  "yuehe-art-healing",
  "tianjin-jizhou",
  "huayang-1982-tvc",
  "guardian-spirit-pearl",
  "skicat-ip-animation",
  "wuhu-motion-design",
];

async function renderPath(pathname) {
  let currentPath = pathname;
  let response = await worker.fetch(
    new Request(`https://mamengyuan-portfolio-2026.pages.dev${currentPath}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: assetBinding,
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  for (let redirectCount = 0; redirectCount < 3 && [301, 302, 307, 308].includes(response.status); redirectCount += 1) {
    const location = response.headers.get("location");
    if (!location) break;
    currentPath = new URL(location, `https://mamengyuan-portfolio-2026.pages.dev${currentPath}`).pathname;
    response = await worker.fetch(
      new Request(`https://mamengyuan-portfolio-2026.pages.dev${currentPath}`, {
        headers: { accept: "text/html" },
      }),
      {
        ASSETS: assetBinding,
      },
      {
        waitUntil() {},
        passThroughOnException() {},
      },
    );
  }

  if (!response.ok) {
    throw new Error(`Static export failed for ${pathname} with HTTP ${response.status}`);
  }

  return response.text();
}

async function writeHtml(pathname, html) {
  const outputDir = new URL(pathname.replace(/^\/+/, ""), clientDir);
  await mkdir(outputDir, { recursive: true });
  await writeFile(new URL("index.html", outputDir), html);
}

const html = await renderPath("/");

await mkdir(clientDir, { recursive: true });
await writeFile(new URL("index.html", clientDir), html);
await copyFile(new URL("index.html", clientDir), new URL("404.html", clientDir));

for (const slug of videoSlugs) {
  const videoHtml = await renderPath(`/videos/${slug}/`);
  await writeHtml(`/videos/${slug}/`, videoHtml);
}

await rm(new URL("../.wrangler/deploy/config.json", import.meta.url), { force: true });
await rm(new URL("../dist/server/wrangler.json", import.meta.url), { force: true });

console.log(`Static site exported to dist/client with ${videoSlugs.length} video pages`);
