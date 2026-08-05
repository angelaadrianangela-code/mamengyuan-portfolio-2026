import type { CSSProperties } from "react";

const projects = [
  {
    index: "01",
    title: "MOMO PET",
    subtitle: "宠物生活方式品牌视觉识别系统",
    tags: ["BRAND IDENTITY", "IP DESIGN", "VISUAL SYSTEM"],
    image: "/assets/project-momopet.webp",
    accent: "#ff6c5f",
  },
  {
    index: "02",
    title: "拾光 SHIGUANG",
    subtitle: "临期食品服务平台 UI / IP 设计",
    tags: ["UI DESIGN", "PRODUCT", "IP DESIGN"],
    image: "/assets/project-ui.webp",
    accent: "#d7ff59",
  },
  {
    index: "03",
    title: "五虎祯祥",
    subtitle: "非物质文化遗产视觉文创设计",
    tags: ["CULTURAL IP", "PACKAGING", "AIGC"],
    image: "/assets/project-wuhu.webp",
    accent: "#ff4c70",
  },
  {
    index: "04",
    title: "上岛 · 咖啡",
    subtitle: "咖啡品牌与线下空间视觉体验",
    tags: ["BRANDING", "RETAIL", "VISUAL IDENTITY"],
    image: "/assets/project-cafe.webp",
    accent: "#b4825e",
  },
  {
    index: "05",
    title: "兰也 LANYE",
    subtitle: "轻奢美妆品牌视觉识别系统",
    tags: ["VI SYSTEM", "RETAIL", "BEAUTY"],
    image: "/assets/project-lanye.webp",
    accent: "#d6b16b",
  },
  {
    index: "06",
    title: "SKICAT",
    subtitle: "滑雪品牌产品视觉与电商设计",
    tags: ["E-COMMERCE", "ART DIRECTION", "LAYOUT"],
    image: "/assets/project-skicat.webp",
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
  return (
    <main>
      <section className="hero" id="home">
        <video
          className="heroVideo"
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/hero-poster.webp"
          aria-label="作品集动态背景"
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="heroShade" />
        <nav className="nav shell" aria-label="主导航">
          <a className="monogram" href="#home" aria-label="返回首页">
            M<span>·</span>MY
          </a>
          <div className="navLinks">
            <a href="#about">关于</a>
            <a href="#work">项目</a>
            <a href="#strengths">能力</a>
          </div>
          <a className="contactPill" href="mailto:2921769497@qq.com">
            联系我 <span>↗</span>
          </a>
        </nav>

        <div className="heroContent shell">
          <div className="heroEyebrow">
            <span className="statusDot" />
            VISUAL DESIGNER · AIGC CREATOR · 2026
          </div>
          <h1>
            <span>MA</span>
            <span>MENGYUAN</span>
          </h1>
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
        <a className="scrollCue" href="#about" aria-label="向下浏览">
          <span>SCROLL</span>
          <i>↓</i>
        </a>
      </section>

      <section className="about shell section" id="about">
        <header className="sectionHead">
          <span>01 / ABOUT</span>
          <p>设计不是装饰，而是让信息与情绪同时抵达。</p>
        </header>

        <div className="aboutGrid">
          <figure className="portraitCard">
            <div className="portraitGlow" />
            <img src="/assets/portrait.webp" alt="马梦圆肖像" />
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

        <div className="stats" aria-label="项目数据">
          <div><strong>21</strong><span>页产品图册独立设计</span></div>
          <div><strong>18%</strong><span>详情页点击率提升</span></div>
          <div><strong>TOP 15%</strong><span>专业成绩排名</span></div>
          <div><strong>06</strong><span>精选项目系统</span></div>
        </div>

        <div className="experience">
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
            <article>
              <time>2023.09 — 2024.09</time>
              <div>
                <h4>校团校新媒体工作中心</h4>
                <p>设计负责人 · 校园艺术周主视觉与新媒体内容运营</p>
              </div>
              <span>CAMPUS</span>
            </article>
          </div>
        </div>
      </section>

      <section className="work section" id="work">
        <div className="shell">
          <header className="sectionHead workHead">
            <span>02 / SELECTED WORK</span>
            <h2>精选项目<sup>06</sup></h2>
          </header>

          <div className="projectGrid">
            {projects.map((project) => (
              <article className="projectCard" key={project.title} style={{ "--accent": project.accent } as CSSProperties}>
                <div className="projectMedia">
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

      <section className="strengths shell section" id="strengths">
        <header className="sectionHead strengthHead">
          <span>03 / STRENGTHS</span>
          <h2>从想法到落地，<br />让每一步都<span>有依据。</span></h2>
        </header>
        <div className="strengthGrid">
          {strengths.map((item) => (
            <article key={item.no}>
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
            <a className="mailButton" href="mailto:2921769497@qq.com"><span>发一封邮件</span><i>↗</i></a>
          </div>
          <div className="footerMeta"><span>© 2026 MA MENGYUAN</span><a href="#home">BACK TO TOP ↑</a></div>
        </div>
      </footer>
    </main>
  );
}
