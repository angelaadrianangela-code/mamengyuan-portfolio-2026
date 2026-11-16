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
  assert.match(html, /精选作品/);
  assert.match(html, /关于我/);
  assert.match(html, /MOMO PET/);
  assert.match(html, /脑洞放映节/);
  assert.doesNotMatch(html, /codex-preview|Building your site/);
});

test("keeps primary navigation anchors always linkable", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /href="#about"[^>]*>关于我<\/a>/);
  assert.match(html, /href="#work"[^>]*>作品<\/a>/);
  assert.doesNotMatch(html, /href="#awards"/);

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
  assert.match(html, /\/hero-ma-mengyuan\.webp/);
  assert.match(html, /fetchPriority="high"/);
  assert.doesNotMatch(html, /\/hero-ma-mengyuan\.png/);
  assert.doesNotMatch(html, /<i>MENGYUAN<\/i>/);
  assert.doesNotMatch(html, /<video/);
  assert.doesNotMatch(html, /hero-video-art-healing\.mp4/);
});

test("exposes both hero rings as keyboard-accessible interactive controls", async () => {
  const html = await (await render()).text();
  assert.equal((html.match(/class="heroOrbButton"/g) || []).length, 2);
  assert.match(html, /aria-label="拖动大圆环探索背景，可用方向键移动，Esc复位"/);
  assert.match(html, /aria-label="拖动小圆环探索背景，可用方向键移动，Esc复位"/);
  assert.doesNotMatch(html, /class="heroMesh interactiveMesh" aria-hidden="true"/);
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

test("renders the redesigned awards without removed resume sections", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /技能证书|普通话二级甲等|国家计算机二级|把设计放进真实场景|详情页点击率提升|从想法到落地/);
  assert.match(html, /id="awards"/);
  assert.equal((html.match(/class="awardRow"/g) || []).length, 6);
  assert.match(html, /获奖/);
  assert.match(html, /米兰设计周/);
  assert.match(html, /全国大学生广告艺术大赛/);
  assert.match(html, /中国大学生广告艺术节学院奖/);
  assert.doesNotMatch(html, /全国大学生广告艺术大赛平面类省二等奖/);
  assert.match(html, /华夏奖文化艺术设计大赛/);
  assert.match(html, /国家级银奖/);
  assert.match(html, /未来设计师/);
  assert.match(html, /好创意全国设计大赛/);
  assert.match(html, /省级优秀奖/);
});

test("renders all six artworks in upload order", async () => {
  const html = await (await render()).text();
  const expected = [
    "「认养一头牛&amp;盒马鲜生」联名视觉KV",
    "「哔哩哔哩」脑洞放映节 活动全案设计",
    "「快手」夜市寻味记 玩法活动设计",
    "「MOMO PET」PupPy Day节日KV",
    "「山西非遗黎侯虎」文创设计",
    "「拾光」临期食品APP",
  ];
  let previous = -1;
  for (const title of expected) {
    const at = html.indexOf(`<h3>${title}</h3>`);
    assert.ok(at > previous, title);
    previous = at;
  }
  assert.match(html, /精选作品<sup>06<\/sup>/);
  assert.equal((html.match(/class="projectCard"/g) || []).length, 6);
  assert.doesNotMatch(html, /精选项目|拾光 SHIGUANG|兰也 LANYE|幻唐志/);
});

test("starts mobile awards collapsed with an accessible disclosure control", async () => {
  const html = await (await render()).text();
  assert.match(html, /id="awards"[^>]*data-expanded="false"/);
  assert.match(html, /class="awardsToggle"[^>]*aria-expanded="false"[^>]*aria-controls="awards-details"/);
  assert.match(html, /id="awards-details"/);
  assert.equal((html.match(/class="awardRow"/g) || []).length, 6);
});

test("preserves the footer message with explicit mobile line boundaries", async () => {
  const html = await (await render()).text();
  assert.match(html, /LET&#x27;S MAKE|LET'S MAKE/);
  assert.match(html, /class="footerSomething">SOMETHING<\/span>/);
  assert.match(html, /<em>VIVID\.<\/em>/);
});

test("loads all six supplied covers at their native proportions", async () => {
  const html = await (await render()).text();
  for (let i = 1; i <= 6; i++) {
    const path = `/assets/works-202611/0${i}-cover.webp`;
    assert.ok(html.includes(path));
    assert.ok((await stat(new URL(`../public${path}`, import.meta.url))).size > 0);
  }
});

test("removes the internship descriptions", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /待办组件程序|向北极限商贸有限公司|class="timeline"/);
});

test("renders the supplied high-resolution portrait", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /\/assets\/portrait-mamengyuan-garden-v5\.webp/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.doesNotMatch(html, /\/assets\/portrait-mamengyuan-v3\.png/);
  assert.doesNotMatch(html, /\/assets\/portrait-mamengyuan-v2\.png/);
  assert.doesNotMatch(html, /\/assets\/portrait-cutout\.png/);
});

test("uses compressed image assets and long-lived cache headers", async () => {
  const hero = await stat(new URL("../public/hero-ma-mengyuan.webp", import.meta.url));
  const portrait = await stat(new URL("../public/assets/portrait-mamengyuan-garden-v5.webp", import.meta.url));
  const headers = await readFile(new URL("../public/_headers", import.meta.url), "utf8");

  assert.ok(hero.size < 120 * 1024);
  assert.ok(portrait.size < 2 * 1024 * 1024);
  assert.match(headers, /\/assets\/\*/);
  assert.match(headers, /Cache-Control: public, max-age=31536000, immutable/);
  assert.match(headers, /\/videos\/covers\/\*/);
  assert.match(headers, /\/videos\/\*\.mp4/);
});

test("does not render the replaced project covers", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /project-lanye-cover|project-ui.webp|project-skicat.webp/);
});

test("uses uncropped responsive artwork covers", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /artworkMedia img[^}]*height: auto/);
  assert.match(css, /artworkMedia img[^}]*object-fit: contain/);
});

test("removes the campus media center experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /校团校新媒体工作中心/);
  assert.doesNotMatch(html, /CAMPUS/);
});

test("opens complete artwork images in the accessible site reader", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /selectedProject.tiles.map/);
  assert.match(source, /key={selectedProject.index}/);
  assert.doesNotMatch(source, /<PdfViewer|selectedProject.pdf|新窗口打开/);
  assert.match(source, /event.key === "Escape"/);
});

test("renders project PDFs inside the site for mobile browsers", async () => {
  const source = await readFile(new URL("../app/pdf-viewer.tsx", import.meta.url), "utf8");
  assert.match(source, /getDocument/);
  assert.match(source, /canvas/);
  assert.match(source, /pdf\.numPages/);
  assert.match(source, /loading/);
  assert.match(source, /pdfViewerToolbar/);
  assert.match(source, /上一页/);
  assert.match(source, /下一页/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /rotation/);
});

test("renders the video project carousel with lazy covers and dedicated playback links", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(html, /动态影像/);
  assert.doesNotMatch(html, /AI动态影像/);
  assert.match(html, /“月河”艺术疗愈短片/);
  assert.match(html, /“五虎祯祥”周边动效设计/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /<video/);

  assert.match(source, /videoRailRef/);
  assert.doesNotMatch(source, /addEventListener\("wheel"/);
  assert.match(source, /scrollVideoRail/);
  assert.match(source, /rail\.scrollLeft \+= delta \* 0\.055/);
  assert.match(source, /scrollBy\(\{ left: direction \* distance, behavior: "smooth" \}\)/);
  assert.doesNotMatch(source, /pointerenter/);
  assert.doesNotMatch(source, /pointerleave/);
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
  assert.match(css, /\.videoRailControls button\s*{[\s\S]*color:\s*var\(--acid\)/);
  assert.match(css, /\.videoRailControls button:hover,[\s\S]*color:\s*#080909/);
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
    ["night-market-avatar-reward", "夜市寻味记 获得头像框"],
    ["night-market-opening", "夜市寻味记 活动开场动画"],
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
