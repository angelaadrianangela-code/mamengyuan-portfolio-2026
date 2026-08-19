"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";

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
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isNavPinned, setIsNavPinned] = useState(false);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const selectedProject = selectedProjectIndex === null ? null : projects[selectedProjectIndex];

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cursor = cursorRef.current;
    const progress = progressRef.current;

    const onPointerMove = (event: PointerEvent) => {
      if (!cursor || event.pointerType === "touch") return;
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      cursor.dataset.visible = "true";
    };
    const onScroll = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;
      setIsNavPinned(window.scrollY > window.innerHeight - 120);
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
    if (selectedProjectIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProjectIndex(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedProjectIndex]);

  const changeProject = (direction: -1 | 1) => {
    setSelectedProjectIndex((current) => {
      if (current === null) return 0;
      return (current + direction + projects.length) % projects.length;
    });
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

  const scrollToAnchor = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const navOffset = targetId === "home" ? 0 : 92;
    const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <main>
      <div className="scrollProgress" ref={progressRef} aria-hidden="true" />
      <div className="cursorAura" ref={cursorRef} aria-hidden="true" />
      <section className="hero" id="home">
        <img className="heroImage" src="/hero-ma-mengyuan.png" alt="" aria-hidden="true" />
        <div className="heroShade" />
        <div className="heroMesh" aria-hidden="true"><span /><span /><span /></div>
        <nav className={`nav shell${isNavPinned ? " isPinned" : ""}`} aria-label="主导航">
          <a className="monogram" href="#home" aria-label="返回首页" onClick={(event) => { event.preventDefault(); scrollToAnchor("home"); }}>
            M<span>·</span>MY
          </a>
          <div className="navLinks">
            <a href="#about" onClick={(event) => { event.preventDefault(); scrollToAnchor("about"); }}>关于</a>
            <a href="#work" onClick={(event) => { event.preventDefault(); scrollToAnchor("work"); }}>项目</a>
            <a href="#strengths" onClick={(event) => { event.preventDefault(); scrollToAnchor("strengths"); }}>能力</a>
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
        <a className="scrollCue" href="#about" aria-label="向下浏览" onClick={(event) => { event.preventDefault(); scrollToAnchor("about"); }}>
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
            <img src="/assets/portrait-mamengyuan-v3.png" alt="马梦圆肖像" />
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
              <a href="tel:13363038187">
                <span>PHONE</span>
                <strong>133 6303 8187</strong>
                <i>↗</i>
              </a>
              <a href="mailto:2921769497@qq.com">
                <span>EMAIL</span>
                <strong>2921769497@qq.com</strong>
                <i>↗</i>
              </a>
              <div>
                <span>WECHAT</span>
                <strong>my2921769497</strong>
                <i>—</i>
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
                <p>平面设计 · 品牌物料、活动 KV、画册展板与视频脚本</p>
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
                  <img src={project.image} alt={`${project.title} 项目展示`} loading="lazy" />
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

      <section className="strengths shell section" id="strengths">
        <header className="sectionHead strengthHead" data-reveal>
          <span>03 / STRENGTHS</span>
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
          <div className="footerTop"><span>04 / CONTACT</span><p>AVAILABLE FOR INTERNSHIP & COLLABORATION</p></div>
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
          <div className="footerMeta"><span>© 2026 MA MENGYUAN</span><a href="#home" onClick={(event) => { event.preventDefault(); scrollToAnchor("home"); }}>BACK TO TOP ↑</a></div>
        </div>
      </footer>
    </main>
  );
}
