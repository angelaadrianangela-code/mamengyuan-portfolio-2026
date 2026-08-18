import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders Ma Mengyuan's portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /马梦圆/);
  assert.match(html, /MA MENGYUAN/);
  assert.match(html, /精选项目/);
  assert.match(html, /MOMO PET/);
  assert.match(html, /SKICAT/);
  assert.doesNotMatch(html, /codex-preview|Building your site/);
});

test("renders the supplied full-screen hero artwork without the old overlay title", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /\/hero-ma-mengyuan\.png/);
  assert.doesNotMatch(html, /<i>MENGYUAN<\/i>/);
  assert.doesNotMatch(html, /<video/);
  assert.doesNotMatch(html, /hero-video-art-healing\.mp4/);
});

test("renders copy actions for phone and email", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /data-copy-value="13363038187"/);
  assert.match(html, /data-copy-value="2921769497@qq\.com"/);
});

test("renders the supplied high-resolution portrait", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /\/assets\/portrait-mamengyuan-v3\.png/);
  assert.doesNotMatch(html, /\/assets\/portrait-mamengyuan-v2\.png/);
  assert.doesNotMatch(html, /\/assets\/portrait-cutout\.png/);
});

test("renders the new LANYE cover in project 05", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /\/assets\/project-lanye-cover\.webp/);
});

test("renders the new Wuhu cover in project 03", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /\/assets\/project-wuhu-cover\.webp/);
  assert.match(html, /projectMedia projectMediaContain/);
});

test("removes the campus media center experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /校团校新媒体工作中心/);
  assert.doesNotMatch(html, /CAMPUS/);
});

test("wires all six project cards to accessible PDF detail readers", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const pdfFiles = [
    "01-momopet.pdf",
    "02-shiguang.pdf",
    "03-wuhu.pdf",
    "04-shangdao-cafe.pdf",
    "05-lanye.pdf",
    "06-skicat.pdf",
  ];

  for (const filename of pdfFiles) {
    assert.match(source, new RegExp(`/projects/${filename.replace(".", "\\.")}`));
    const file = await stat(new URL(`../public/projects/${filename}`, import.meta.url));
    assert.ok(file.size > 0);
  }

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /<iframe/);
  assert.doesNotMatch(source, /新窗口打开/);
  assert.doesNotMatch(source, /target="_blank"/);
  assert.match(source, /event\.key === "Escape"/);
});
