"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { videoProjects } from "./video-projects";
import { projects } from "./artworks";
import { HeroOrbs } from "./hero-orbs";


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
  const [awardsExpanded, setAwardsExpanded] = useState(false);
  const selectedProject = selectedProjectIndex === null ? null : projects[selectedProjectIndex];
  const selectedVideo = selectedVideoIndex === null ? null : videoProjects[selectedVideoIndex];

  useLayoutEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>(".artworkGrid .projectCard")];
    const update = () => cards.forEach((card) => {
      const height = [...card.children].reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);
      card.style.gridRowEnd = `span ${Math.ceil((height + 8) / 4)}`;
      card.parentElement?.setAttribute("data-masonry", "true");
    });
    const observer = new ResizeObserver(update);
    cards.forEach((card) => [...card.children].forEach((child) => observer.observe(child)));
    update();
    return () => observer.disconnect();
  }, []);

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
          <a href="#work" onClick={(event) => handleAnchorClick(event, "work")}>作品</a>
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
        <HeroOrbs />

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
          <figure className="portraitCard portraitPhoto">
            <img
              src="/assets/portrait-mamengyuan-garden-v5.webp"
              alt="马梦圆肖像"
              width={3068}
              height={4096}
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
              专注视觉与AIGC 创作，多次主导视觉KV、IP角色设计和AIGC内容创作等项目，擅长把复杂需求整理成清晰、统一且具有传播力的视觉语言。
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

        <section className="awards" id="awards" aria-labelledby="awards-title" data-expanded={awardsExpanded}>
          <header className="awardsHeading" data-reveal>
            <span>03 / AWARDS</span>
            <h3 id="awards-title">获奖</h3>
            <button className="awardsToggle" type="button" aria-expanded={awardsExpanded}
              aria-controls="awards-details" aria-label={awardsExpanded ? "收起获奖详情" : "展开获奖详情"}
              onClick={() => setAwardsExpanded((expanded) => !expanded)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p>SELECTED HONORS</p>
          </header>
          <div className="awardsList" id="awards-details">
            {[
              ["华夏奖文化艺术设计大赛", "视觉传达类", "国家级银奖"],
              ["米兰设计周", "非命题赛道", "省三等奖"],
              ["未来设计师", "文创设计赛道", "省级三等奖"],
              ["好创意全国设计大赛", "视传应用类", "省级优秀奖"],
              ["全国大学生广告艺术大赛", "平面广告类", "优秀奖"],
              ["中国大学生广告艺术节学院奖", "视频类", "优秀奖"],
            ].map(([name, category, prize], index) => (
              <article className="awardRow" key={name} data-reveal>
                <span className="awardIndex">{String(index + 1).padStart(2, "0")}</span>
                <div><h4>{name}</h4><p>{category}</p></div>
                <span className="awardPrize">{prize}</span>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="work section" id="work">
        <div className="shell">
          <header className="sectionHead workHead" data-reveal>
            <span>02 / SELECTED WORK</span>
            <h2>精选作品<sup>{String(projects.length).padStart(2, "0")}</sup></h2>
          </header>

          <div className="projectGrid artworkGrid">
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
                <div className="projectMedia artworkMedia">
                  <img
                    src={project.image}
                    alt={`${project.title} 项目展示`}
                    width={project.width}
                    height={project.height}
                    loading={projectIndex < 2 ? "eager" : "lazy"}
                    fetchPriority={projectIndex < 2 ? "high" : "auto"}
                    decoding="async"
                  />
                </div>
                <div className="projectInfo">
                  <h3>{project.title}</h3>
                  <span aria-hidden="true">↗</span>
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
            <h2>动态影像<sup>{String(videoProjects.length).padStart(2, "0")}</sup></h2>
            <div className="videoRailControls" aria-label="调节视频项目进度">
              <button type="button" onClick={() => scrollVideoRail(-1)} aria-label="向左浏览视频项目">←</button>
              <button type="button" onClick={() => scrollVideoRail(1)} aria-label="向右浏览视频项目">→</button>
            </div>
          </header>
        </div>

        <div className="videoRailWrap" data-reveal>
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
                  <img
                    src={video.cover}
                    alt={`${video.title} 封面`}
                    width={1200}
                    height={675}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
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
            <div className="projectReaderBody" key={selectedProject.index}>
              <div className="artworkDetail">
                {selectedProject.tiles.map((tile, index) => (
                  <img key={tile.src} src={tile.src} width={tile.width} height={tile.height}
                    alt={`${selectedProject.title} · ${index + 1}`} loading={index === 0 ? "eager" : "lazy"}
                    decoding="async" />
                ))}
              </div>
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

      <footer className="footer" id="contact">
        <div className="footerGrid" aria-hidden="true" />
        <div className="shell footerInner">
          <div className="footerTop"><span>05 / CONTACT</span><p>AVAILABLE FOR INTERNSHIP & COLLABORATION</p></div>
          <div className="footerTitle"><span>LET&apos;S MAKE</span><span><span className="footerSomething">SOMETHING</span>{" "}<em>VIVID.</em></span></div>
          <div className="footerBottom">
            <div><p>有工作机会、项目或一个值得讨论的想法?</p><p>欢迎来信，我会尽快回复。</p></div>
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
