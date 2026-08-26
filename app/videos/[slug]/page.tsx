import { notFound } from "next/navigation";
import { videoProjects } from "../../video-projects";

type VideoPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return videoProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { slug } = await params;
  const project = videoProjects.find((item) => item.slug === slug);

  if (!project) return {};

  return {
    title: `${project.title} | 马梦圆作品集`,
    description: project.type,
    openGraph: {
      title: `${project.title} | 马梦圆作品集`,
      description: project.type,
      images: [{ url: project.cover }],
    },
  };
}

export default async function VideoProjectPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const project = videoProjects.find((item) => item.slug === slug);

  if (!project) notFound();

  return (
    <main className="videoPage">
      <div className="videoPageBg" aria-hidden="true" />
      <header className="videoPageHeader shell">
        <a className="videoBack" href="/#video">← 返回视频项目</a>
        <span>{project.index} / MOTION</span>
      </header>

      <section className="videoPlayerShell shell">
        <div className="videoPageTitle">
          <p>{project.type}</p>
          <h1>{project.title}</h1>
        </div>

        <div className="videoPlayerFrame">
          <video
            src={project.video}
            poster={project.cover}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </section>
    </main>
  );
}
