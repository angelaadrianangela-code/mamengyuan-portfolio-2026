import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
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
  assert.match(html, /关于我/);
  assert.match(html, /MOMO PET/);
  assert.match(html, /SKICAT/);
  assert.doesNotMatch(html, /codex-preview|Building your site/);
});

test("keeps primary navigation anchors always linkable", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /href="#about"[^>]*>关于我<\/a>/);
  assert.match(html, /href="#work"[^>]*>项目<\/a>/);
  assert.match(html, /href="#strengths"[^>]*>能力<\/a>/);

  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /handleAnchorClick/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /window\.scrollTo\(\{/);
  assert.match(source, /behavior:\s*prefersReducedMotion \? "auto" : "smooth"/);
  assert.doesNotMatch(source, /scrollAnimationRef|scrollAbortRef|AbortController/);
  assert.doesNotMatch(source, /window\.addEventListener\("wheel"/);
  assert.doesNotMatch(source, /isNavPinned|setIsNavPinned|scrollToAnchor/);
});

test("keeps the navigation fixed above every section", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /<main>[\s\S]*<nav className=\{`nav shell/);
  assert.doesNotMatch(source, /<section className="hero" id="home">[\s\S]*<nav className="nav shell"/);
  assert.match(source, /selectedProject \|\| selectedVideo \|\| isFooterVisible \? " navHidden" : ""/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.nav\s*{[\s\S]*position:\s*fixed/);
  assert.match(css, /\.nav\s*{[\s\S]*z-index:\s*1000/);
  assert.match(css, /\.navLinks a\s*{[\s\S]*min-height:\s*44px/);
  assert.match(css, /\.navHidden\s*{[\s\S]*pointer-events:\s*none/);
  assert.match(css, /\.navHidden\s*{[\s\S]*animation:\s*none !important/);
  assert.match(css, /\.navHidden\s*{[\s\S]*visibility:\s*hidden/);
  assert.doesNotMatch(css, /\.nav\.isPinned/);
});

test("exports a static homepage for Cloudflare Pages", async () => {
  const html = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  assert.match(html, /马梦圆/);
  assert.match(html, /\/assets\//);
});

test("removes generated Worker config that breaks Cloudflare Pages", async () => {
  await assert.rejects(access(new URL("../.wrangler/deploy/config.json", import.meta.url)));
  await assert.rejects(access(new URL("../dist/server/wrangler.json", import.meta.url)));
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

test("renders simplified contact labels and copy actions", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, />电话<\/span>/);
  assert.match(html, />邮箱<\/span>/);
  assert.match(html, />微信<\/span>/);
  assert.match(html, /复制电话 13363038187/);
  assert.match(html, /复制邮箱 2921769497@qq\.com/);
  assert.match(html, /复制微信 my2921769/);
  assert.match(html, /my2921769/);
  assert.doesNotMatch(html, /my2921769497/);
  assert.doesNotMatch(html, />PHONE<\/span>|>EMAIL<\/span>|>WECHAT<\/span>/);
});

test("starts new visits from the hero screen", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /scrollRestoration = "manual"/);
  assert.match(source, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
  assert.match(source, /window\.location\.hash/);
  assert.match(source, /window\.history\.replaceState/);
});

test("renders the certificate section below experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /技能证书/);
  assert.match(html, /Photoshop/);
  assert.match(html, /Illustrator/);
  assert.match(html, /Figma/);
  assert.match(html, /普通话二级甲等/);
  assert.match(html, /国家计算机二级/);
  assert.match(html, /获奖/);
  assert.match(html, /米兰设计周非命题赛道省三等奖/);
  assert.match(html, /全国大学生广告艺术大赛优秀奖/);
  assert.match(html, /中国大学生广告艺术节学院奖 视频类优秀奖/);
  assert.doesNotMatch(html, /全国大学生广告艺术大赛平面类省二等奖/);
});

test("renders the updated Schneider internship description", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /平面设计 · 品牌物料、活动 KV、画册展板与视频脚本、待办组件程序/);
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

test("renders the video project carousel with lazy covers and dedicated playback links", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(html, /AI动态影像/);
  assert.match(html, /“月河”艺术疗愈短片/);
  assert.match(html, /“五虎祯祥”周边动效设计/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /<video/);

  assert.match(source, /videoRailRef/);
  assert.doesNotMatch(source, /addEventListener\("wheel"/);
  assert.match(source, /scrollVideoRail/);
  assert.match(source, /scrollBy\(\{ left: direction \* distance, behavior: "smooth" \}\)/);
  assert.match(source, /setSelectedVideoIndex\(itemIndex % videoProjects\.length\)/);
  assert.match(source, /关闭视频播放/);
  assert.match(source, /播放上一个视频/);
  assert.match(source, /播放下一个视频/);
  assert.match(source, /requestAnimationFrame\(animate\)/);
  assert.match(source, /\[\.\.\.videoProjects, \.\.\.videoProjects\]/);

  assert.match(css, /\.videoRail\s*{[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /\.videoRail\s*{[\s\S]*scroll-snap-type:\s*x mandatory/);
  assert.match(css, /\.videoRail\[data-auto="true"\]\s*{[\s\S]*scroll-snap-type:\s*none/);
  assert.match(css, /\.videoRail::-webkit-scrollbar\s*{[\s\S]*display:\s*none/);
  assert.match(css, /\.videoRailControls button/);
  assert.match(css, /\.videoCard:hover img/);
});

test("exports all video pages and public video assets", async () => {
  const videos = [
    ["yuehe-art-healing", "“月河”艺术疗愈短片"],
    ["tianjin-jizhou", "天津蓟州区家乡宣传短片"],
    ["huayang-1982-tvc", "“华洋1982”TVC短片"],
    ["guardian-spirit-pearl", "“守护灵珠”动画短片"],
    ["skicat-ip-animation", "“滑雪猫”IP动画短片"],
    ["wuhu-motion-design", "“五虎祯祥”周边动效设计"],
  ];

  for (const [slug, title] of videos) {
    const video = await stat(new URL(`../public/videos/${slug}.mp4`, import.meta.url));
    const cover = await stat(new URL(`../public/videos/covers/${slug}.webp`, import.meta.url));
    const page = await readFile(new URL(`../dist/client/videos/${slug}/index.html`, import.meta.url), "utf8");

    assert.ok(video.size > 0);
    assert.ok(video.size < 100 * 1024 * 1024);
    assert.ok(cover.size > 0);
    assert.match(page, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(page, new RegExp(`/videos/${slug}\\.mp4`));
    assert.match(page, /preload="metadata"/);
  }
});
