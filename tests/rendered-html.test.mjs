import assert from "node:assert/strict";
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
