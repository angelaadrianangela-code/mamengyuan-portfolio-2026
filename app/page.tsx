"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { videoProjects } from "./video-projects";

const projects = [
  {
    index: "01",
    title: "MOMO PET",
    subtitle: "宠物生活方式品牌视觉识别系统",
    tags: ["BRAND IDENTITY", "IP DESIGN", "VISUAL SYSTEM"],
    image: "/assets/project-momopet.webp",
    pdf: "/projects/01-momopet.pdf",
    accent: "#ff6c5f",
  },
  {
    index: "02",
    title: "拾光 SHIGUANG",
    subtitle: "临期食品服务平台 UI / IP 设计",
    tags: ["UI DESIGN", "PRODUCT", "IP DESIGN"],
    image: "/assets/project-ui.webp",
    pdf: "/projects/02-shiguang.pdf",
    accent: "#d7ff59",
  },
  {
    index: "03",
    title: "五虎祯祥",
    subtitle: "非物质文化遗产视觉文创设计",
    tags: ["CULTURAL IP", "PACKAGING", "AIGC"],
    image: "/assets/project-wuhu-cover.webp",
    pdf: "/projects/03-wuhu.pdf",
    fit: "contain",
    accent: "#ff4c70",
  },
  {
    index: "04",
    title: "上岛 · 咖啡",
    subtitle: "咖啡品牌与线下空间视觉体验",
    tags: ["BRANDING", "RETAIL", "VISUAL IDENTITY"],
    image: "/assets/project-cafe.webp",
    pdf: "/projects/04-shangdao-cafe.pdf",
    accent: "#b4825e",
  },
  {
    index: "05",
    title: "兰也 LANYE",
    subtitle: "轻奢美妆品牌视觉识别系统",
    tags: ["VI SYSTEM", "RETAIL", "BEAUTY"],
    image: "/assets/project-lanye-cover.webp",
    pdf: "/projects/05-lanye.pdf",
    accent: "#d6b16b",
  },
  {
    index: "06",
    title: "SKICAT",
    subtitle: "滑雪品牌产品视觉与电商设计",
    tags: ["E-COMMERCE", "ART DIRECTION", "LAYOUT"],
    image: "/assets/project-skicat.webp",
    pdf: "/projects/06-skicat.pdf",
    accent: "#f45e43",
  },
];

const strengths = [
  {
    no: "A",
    title: "品牌视觉系统",
    en: "Brand Systems",
    text: "从品牌概念、标志规范到应用落地，把分散触点组织成有识别度的完整视觉语言。",
    tools: "PS · AI · FIGMA",
  },
  {
    no: "B",
    title: "UI 与体验设计",
    en: "Digital Experience",
    text: "兼顾信息层级、用户路径与品牌表达，让界面不仅清晰易用，也拥有鲜明气质。",
    tools: "FIGMA · PROTOTYPE",
  },
  {
    no: "C",
    title: "AIGC 动态创作",
    en: "AI Motion Creation",
    text: "探索图像生成、动画与剪辑的组合工作流，把概念快速转化为可传播的动态内容。",
    tools: "JIMENG · AE · CAPCUT",
  },
  {
    no: "D",
    title: "落地与协作",
    en: "Delivery & Collaboration",
    text: "主动拆解需求、预判风险并推进交付，在品牌规范与真实业务目标之间找到平衡。",
    tools: "BRIEF · SYSTEM · DELIVERY",
  },
];

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const videoRailRef = useRef<HTMLDivElement>(null);
  const videoAutoScrollRef = useRef<number | null>(null);
  const videoPausedRef = useRef(false);
  const videoResumeTimerRef = useRef<number | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const selectedProject = selectedProjectIndex === null ? null : projects[selectedProjectIndex];
  const selectedVideo = selectedVideoIndex === null ? null : videoProjects[selectedVideoIndex];

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const resetScroll = window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);

    return () => {
      window.clearTimeout(resetScroll);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cursor = cursorRef.current;
    const progress = progressRef.current;
    const footer = document.getElementById("contact");

    const onPointerMove = (event: PointerEvent) => {
      if (!cursor || event.pointerType === "touch") return;
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      cursor.dataset.visible = "true";
    };
    const onScroll = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;

      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        setIsFooterVisible(footerRect.top <= window.innerHeight * 0.86 && footerRect.bottom > 80);
      }
    };

    const observer = reduceMotion
      ? null
      : new IntersectionObserver(
          (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("isVisible")),
          { threshold: 0.13, rootMargin: "0px 0px -7%" },
        );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      if (reduceMotion) element.classList.add("isVisible");
      else observer?.observe(element);
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const rail = videoRailRef.current;
    if (!rail) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let previousTime = performance.now();

    const pause = () => {
      videoPausedRef.current = true;
      rail.removeAttribute("data-auto");
      if (videoResumeTimerRef.current !== null) {
        window.clearTimeout(videoResumeTimerRef.current);
        videoResumeTimerRef.current = null;
      }
    };

    const resumeSoon = (delay = 1100) => {
      if (videoResumeTimerRef.current !== null) window.clearTimeout(videoResumeTimerRef.current);
      videoResumeTimerRef.current = window.setTimeout(() => {
        videoPausedRef.current = false;
        rail.dataset.auto = "true";
        videoResumeTimerRef.current = null;
      }, delay);
    };

    const loopRail = () => {
      const loopWidth = rail.scrollWidth / 2;
      if (loopWidth <= 0) return;
      if (rail.scrollLeft >= loopWidth) rail.scrollLeft -= loopWidth;
      if (rail.scrollLeft < 0) rail.scrollLeft += loopWidth;
    };

    const animate = (time: number) => {
      const delta = Math.min(time - previousTime, 48);
      previousTime = time;

      if (!prefersReducedMotion && !videoPausedRef.current) {
        rail.scrollLeft += delta * 0.055;
        loopRail();
      }

      videoAutoScrollRef.current = requestAnimationFrame(animate);
    };

    const onPointerDown = () => pause();
    const onPointerUp = () => resumeSoon(900);
    const onFocusIn = () => pause();
    const onFocusOut = () => resumeSoon(500);

    rail.dataset.auto = "true";
    rail.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    rail.addEventListener("focusin", onFocusIn);
    rail.addEventListener("focusout", onFocusOut);
    videoAutoScrollRef.current = requestAnimationFrame(animate);

    return () => {
      if (videoAutoScrollRef.current !== null) cancelAnimationFrame(videoAutoScrollRef.current);
      if (videoResumeTimerRef.current !== null) window.clearTimeout(videoResumeTimerRef.current);
      rail.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      rail.removeEventListener("focusin", onFocusIn);
      rail.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    if (selectedProjectIndex === null && selectedVideoIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProjectIndex(null);
        setSelectedVideoIndex(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedProjectIndex, selectedVideoIndex]);

  const changeProject = (direction: -1 | 1) => {
    setSelectedProjectIndex((current) => {
      if (current === null) return 0;
      return (current + direction + projects.length) % projects.length;
    });
  };

  const changeVideo = (direction: -1 | 1) => {
    setSelectedVideoIndex((current) => {
      if (current === null) return 0;
      return (current + direction + videoProjects.length) % videoProjects.length;
    });
  };

  const scrollVideoRail = (direction: -1 | 1) => {
    const rail = videoRailRef.current;
    if (!rail) return;

    videoPausedRef.current = true;
    rail.removeAttribute("data-auto");
    if (videoResumeTimerRef.current !== null) window.clearTimeout(videoResumeTimerRef.current);

    const card = rail.querySelector<HTMLElement>(".videoCard");
    const distance = card ? card.getBoundingClientRect().width + 24 : rail.clientWidth * 0.7;
    rail.scrollBy({ left: direction * distance, behavior: "smooth" });

    videoResumeTimerRef.current = window.setTimeout(() => {
      videoPausedRef.current = false;
      rail.dataset.auto = "true";
      videoResumeTimerRef.current = null;
    }, 1800);
  };

  const moveProjectGlow = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - bounds.top}px`);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue((current) => (current === value ? null : current)), 1600);
  };

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = document.querySelector<HTMLElement>(".nav");
    const navBottom = nav ? nav.getBoundingClientRect().bottom : 96;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const offset = targetId === "home" ? 0 : navBottom + 24;
    const targetY = Math.min(Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0), maxY);

    window.scrollTo({
      top: targetY,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    window.history.replaceState(null, "", `#${targetId}`);
  };

  return (
    <main>
      <div className="scrollProgress" ref={progressRef} aria-hidden="true" />
      <div className="cursorAura" ref={cursorRef} aria-hidden="true" />
      <nav className={`nav shell${selectedProject || selectedVideo || isFooterVisible ? " navHidden" : ""}`} aria-label="主导航">
        <a className="monogram" href="#home" aria-label="返回首页" onClick={(event) => handleAnchorClick(event, "home")}>
          M<span>·</span>MY
        </a>
        <div className="navLinks">
          <a href="#about" onClick={(event) => handleAnchorClick(event, "about")}>关于我</a>
          <a href="#work" onClick={(event) => handleAnchorClick(event, "work")}>项目</a>
          <a href="#strengths" onClick={(event) => handleAnchorClick(event, "strengths")}>能力</a>
        </div>
        <button
          className="contactPill"
          type="button"
          data-copy-value="13363038187"
          data-copy-active={copiedValue === "13363038187"}
          onClick={() => copyToClipboard("13363038187")}
          aria-label="复制电话 13363038187"
        >
          {copiedValue === "13363038187" ? "已复制电话" : "联系我"} <span>↗</span>
        </button>
      </nav>
      <section className="hero" id="home">
        <img
          className="heroImage"
          src="/hero-ma-mengyuan.webp"
          alt=""
          aria-hidden="true"
          width={1672}
          height={941}
          decoding="async"
          fetchPriority="high"
        />
        <div className="heroShade" />
        <div className="heroMesh" aria-hidden="true"><span /><span /><span /></div>

        <div className="heroContent shell">
          <div className="heroEyebrow">
            <span className="statusDot" />
            VISUAL DESIGNER · AIGC CREATOR · 2026
          </div>
          <div className="heroBottom">
            <p>
              用品牌、界面与动态影像，
              <br />
              构建有记忆点的视觉体验。
            </p>
            <div className="heroMeta">
              <span>BASED IN CHINA</span>
              <span>河北工业大学 · 艺术与科技</span>
            </div>
          </div>
        </div>
        <a className="scrollCue" href="#about" aria-label="向下浏览" onClick={(event) => handleAnchorClick(event, "about")}>
          <span>SCROLL</span>
          <i>↓</i>
        </a>
        <div className="heroCoordinates" aria-hidden="true"><span>39.9042° N</span><span>116.4074° E</span></div>
      </section>

      <div className="marquee" aria-label="设计方向">
        <div className="marqueeTrack">
          <span>BRAND SYSTEMS</span><i>✦</i><span>VISUAL DESIGN</span><i>✦</i><span>AIGC MOTION</span><i>✦</i><span>DIGITAL EXPERIENCE</span><i>✦</i>
          <span aria-hidden="true">BRAND SYSTEMS</span><i aria-hidden="true">✦</i><span aria-hidden="true">VISUAL DESIGN</span><i aria-hidden="true">✦</i><span aria-hidden="true">AIGC MOTION</span><i aria-hidden="true">✦</i><span aria-hidden="true">DIGITAL EXPERIENCE</span><i aria-hidden="true">✦</i>
        </div>
      </div>

      <section className="about shell section" id="about">
        <header className="sectionHead" data-reveal>
          <span>01 / ABOUT</span>
          <p>设计不是装饰，而是让信息与情绪同时抵达。</p>
        </header>

        <div className="aboutGrid" data-reveal>
          <figure className="portraitCard">
            <div className="portraitGlow" />
            <img
              src="/assets/portrait-mamengyuan-v4.webp"
              alt="马梦圆肖像"
              width={1500}
              height={2097}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>MA MENGYUAN</span>
              <span>VISUAL DESIGNER</span>
            </figcaption>
          </figure>

          <div className="aboutCopy">
            <p className="kicker">你好，我是马梦圆。</p>
            <h2>
              我在理性系统与
              <br />
              <em>鲜活表达</em>之间做设计。
            </h2>
            <p className="intro">
              河北工业大学艺术与科技专业本科在读，专注品牌视觉、UI 与 AIGC 创作。
              多次主导品牌物料、IP、界面和动态内容项目，擅长把复杂需求整理成清晰、统一且具有传播力的视觉语言。
            </p>

            <div className="contactRows">
              <div>
                <span>电话</span>
                <strong>133 6303 8187</strong>
                <button
                  className="contactCopyButton"
                  type="button"
                  onClick={() => copyToClipboard("13363038187")}
                  aria-label="复制电话 13363038187"
                >
                  {copiedValue === "13363038187" ? "✓" : "↗"}
                </button>
              </div>
              <div>
                <span>邮箱</span>
                <strong>2921769497@qq.com</strong>
                <button
                  className="contactCopyButton"
                  type="button"
                  onClick={() => copyToClipboard("2921769497@qq.com")}
                  aria-label="复制邮箱 2921769497@qq.com"
                >
                  {copiedValue === "2921769497@qq.com" ? "✓" : "↗"}
                </button>
              </div>
              <div>
                <span>微信</span>
                <strong>my2921769</strong>
                <button
                  className="contactCopyButton"
                  type="button"
                  onClick={() => copyToClipboard("my2921769")}
                  aria-label="复制微信 my2921769"
                >
                  {copiedValue === "my2921769" ? "✓" : "↗"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="stats" aria-label="项目数据" data-reveal>
          <div><strong>21</strong><span>页产品图册独立设计</span></div>
          <div><strong>18%</strong><span>详情页点击率提升</span></div>
          <div><strong>TOP 15%</strong><span>专业成绩排名</span></div>
          <div><strong>06</strong><span>精选项目系统</span></div>
        </div>

        <div className="experience" data-reveal>
          <div className="experienceTitle">
            <span>EXPERIENCE</span>
            <h3>把设计放进真实场景。</h3>
          </div>
          <div className="timeline">
            <article>
              <time>2026.04 — 08</time>
              <div>
                <h4>施耐德万高（天津）电气有限公司</h4>
                <p>平面设计 · 品牌物料、活动 KV、画册展板与视频脚本、待办组件程序</p>
              </div>
              <span>TIANJIN</span>
            </article>
            <article>
              <time>2025.07 — 10</time>
              <div>
                <h4>向北极限商贸有限公司</h4>
                <p>品牌视觉设计 · SKICAT 产品图册、电商详情与 IP 方案</p>
              </div>
              <span>CHENGDE</span>
            </article>
          </div>
        </div>

        <div className="certificates" data-reveal>
          <div className="experienceTitle">
            <span>CERTIFICATES</span>
            <h3>技能证书</h3>
          </div>
          <div className="certificateList">
            <article>
              <span>01</span>
              <p><strong>设计与办公软件：</strong>Photoshop、Illustrator、Figma、剪映、Blender、AE、WPS、AI 工具（即梦、Codex、ChatGPT、Lovart、Gemini、TapNow 等）。</p>
            </article>
            <article>
              <span>02</span>
              <p><strong>证书：</strong>普通话二级甲等、国家计算机二级（WPS Office）。</p>
            </article>
            <article>
              <span>03</span>
              <p><strong>获奖：</strong>2026 年 米兰设计周非命题赛道省三等奖，米兰国际艺术设计大赛金奖，好创意暨全国数字艺术设计大赛省三等奖。2025 年 全国大学生广告艺术大赛优秀奖，中国大学生广告艺术节学院奖 视频类优秀奖。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="work section" id="work">
        <div className="shell">
          <header className="sectionHead workHead" data-reveal>
            <span>02 / SELECTED WORK</span>
            <h2>精选项目<sup>06</sup></h2>
          </header>

          <div className="projectGrid">
            {projects.map((project, projectIndex) => (
              <article
                className="projectCard"
                key={project.title}
                style={{ "--accent": project.accent } as CSSProperties}
                onMouseMove={moveProjectGlow}
                onClick={() => setSelectedProjectIndex(projectIndex)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedProjectIndex(projectIndex);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`浏览 ${project.title} 项目详情`}
                data-reveal
              >
                <div className={`projectMedia${project.fit === "contain" ? " projectMediaContain" : ""}`}>
                  <img src={project.image} alt={`${project.title} 项目展示`} loading="lazy" decoding="async" />
                  <span className="projectIndex">{project.index}</span>
                  <span className="viewMark">VIEW CASE ↗</span>
                </div>
                <div className="projectInfo">
                  <div><h3>{project.title}</h3><p>{project.subtitle}</p></div>
                  <ul aria-label="项目类型">
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="videoShowcase section" id="video">
        <div className="shell">
          <header className="sectionHead videoHead" data-reveal>
            <span>03 / VIDEO PROJECTS</span>
            <h2>AI动态影像<sup>06</sup></h2>
          </header>
        </div>

        <div className="videoRailWrap" data-reveal>
          <div className="videoRailControls" aria-label="调节视频项目进度">
            <button type="button" onClick={() => scrollVideoRail(-1)} aria-label="向左浏览视频项目">←</button>
            <button type="button" onClick={() => scrollVideoRail(1)} aria-label="向右浏览视频项目">→</button>
          </div>
          <div className="videoRail" ref={videoRailRef} aria-label="视频项目横向列表">
            {[...videoProjects, ...videoProjects].map((video, itemIndex) => (
              <button
                className={`videoCard${video.fit === "contain" ? " videoCardContain" : ""}`}
                type="button"
                key={`${video.slug}-${itemIndex}`}
                onClick={() => setSelectedVideoIndex(itemIndex % videoProjects.length)}
                aria-label={`播放 ${video.title}`}
                aria-hidden={itemIndex >= videoProjects.length ? "true" : undefined}
                tabIndex={itemIndex >= videoProjects.length ? -1 : 0}
              >
                <figure>
                  <img src={video.cover} alt={`${video.title} 封面`} loading="lazy" decoding="async" />
                  <span className="videoIndex">{video.index}</span>
                  <span className="playMark" aria-hidden="true">▶</span>
                </figure>
                <div className="videoInfo">
                  <h3>{video.title}</h3>
                  <p>{video.type}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedProject && (
        <div
          className="projectReader"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} 项目详情`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProjectIndex(null);
          }}
        >
          <div className="projectReaderPanel" style={{ "--accent": selectedProject.accent } as CSSProperties}>
            <header className="projectReaderHeader">
              <div className="projectReaderIdentity">
                <span>{selectedProject.index} / PROJECT</span>
                <strong>{selectedProject.title}</strong>
              </div>
              <div className="projectReaderActions">
                <button type="button" onClick={() => changeProject(-1)} aria-label="浏览上一个项目">← 上一个</button>
                <button type="button" onClick={() => changeProject(1)} aria-label="浏览下一个项目">下一个 →</button>
                <button className="projectReaderClose" type="button" onClick={() => setSelectedProjectIndex(null)} aria-label="关闭项目详情">关闭 ×</button>
              </div>
            </header>
            <div className="projectReaderBody">
              <iframe src={`${selectedProject.pdf}#view=FitH&toolbar=1`} title={`${selectedProject.title} 项目 PDF`} />
            </div>
          </div>
        </div>
      )}

      {selectedVideo && (
        <div
          className="projectReader videoReader"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedVideo.title} 视频播放`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedVideoIndex(null);
          }}
        >
          <div className="projectReaderPanel videoReaderPanel" style={{ "--accent": "#d8ff58" } as CSSProperties}>
            <header className="projectReaderHeader">
              <div className="projectReaderIdentity">
                <span>{selectedVideo.index} / VIDEO</span>
                <strong>{selectedVideo.title}</strong>
              </div>
              <div className="projectReaderActions">
                <button type="button" onClick={() => changeVideo(-1)} aria-label="播放上一个视频">← 上一个</button>
                <button type="button" onClick={() => changeVideo(1)} aria-label="播放下一个视频">下一个 →</button>
                <button className="projectReaderClose" type="button" onClick={() => setSelectedVideoIndex(null)} aria-label="关闭视频播放">关闭 ×</button>
              </div>
            </header>
            <div className="videoReaderBody">
              <video
                src={selectedVideo.video}
                poster={selectedVideo.cover}
                controls
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      )}

      <section className="strengths shell section" id="strengths">
        <header className="sectionHead strengthHead" data-reveal>
          <span>04 / STRENGTHS</span>
          <h2>从想法到落地，<br />让每一步都<span>有依据。</span></h2>
        </header>
        <div className="strengthGrid">
          {strengths.map((item) => (
            <article key={item.no} data-reveal>
              <div className="strengthNo">{item.no}</div>
              <div className="strengthIcon" aria-hidden="true"><span /><i /></div>
              <h3>{item.title}</h3>
              <h4>{item.en}</h4>
              <p>{item.text}</p>
              <footer>{item.tools}</footer>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footerGrid" aria-hidden="true" />
        <div className="shell footerInner">
          <div className="footerTop"><span>05 / CONTACT</span><p>AVAILABLE FOR INTERNSHIP & COLLABORATION</p></div>
          <div className="footerTitle"><span>LET&apos;S MAKE</span><span>SOMETHING <em>VIVID.</em></span></div>
          <div className="footerBottom">
            <div><p>有项目、实习机会或一个值得讨论的想法？</p><p>欢迎来信，我会尽快回复。</p></div>
            <button
              className="mailButton"
              type="button"
              data-copy-value="2921769497@qq.com"
              data-copy-active={copiedValue === "2921769497@qq.com"}
              onClick={() => copyToClipboard("2921769497@qq.com")}
              aria-label="复制邮箱 2921769497@qq.com"
            >
              <span>{copiedValue === "2921769497@qq.com" ? "邮箱已复制" : "发一封邮件"}</span><i>↗</i>
            </button>
          </div>
          <div className="footerMeta"><span>© 2026 MA MENGYUAN</span><a href="#home" onClick={(event) => handleAnchorClick(event, "home")}>BACK TO TOP ↑</a></div>
        </div>
      </footer>
    </main>
  );
}
