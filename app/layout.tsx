import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "马梦圆 | 视觉设计与 AIGC 作品集",
  description: "马梦圆的品牌视觉、UI、文创与 AIGC 设计作品集。",
  icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
  openGraph: {
    title: "马梦圆 | 视觉设计与 AIGC 作品集",
    description: "品牌视觉、UI、文创与 AIGC 设计作品。",
    type: "website",
    images: [{ url: "/og-art-healing-v3.png", width: 1680, height: 945, alt: "马梦圆视觉设计作品集" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "马梦圆 | 视觉设计与 AIGC 作品集",
    description: "品牌视觉、UI、文创与 AIGC 设计作品。",
    images: ["/og-art-healing-v3.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const imagePreloads = [
    "/hero-ma-mengyuan.webp",
    "/assets/portrait-mamengyuan-v4.webp",
    "/assets/project-momopet.webp",
    "/assets/project-ui.webp",
    "/assets/project-wuhu-cover.webp",
    "/assets/project-cafe.webp",
    "/assets/project-lanye-cover.webp",
    "/assets/project-skicat.webp",
    "/videos/covers/yuehe-art-healing.webp",
    "/videos/covers/tianjin-jizhou.webp",
    "/videos/covers/huayang-1982-tvc.webp",
    "/videos/covers/guardian-spirit-pearl.webp",
    "/videos/covers/skicat-ip-animation.webp",
    "/videos/covers/wuhu-motion-design.webp",
  ];

  return (
    <html lang="zh-CN">
      <head>
        {imagePreloads.map((href) => <link key={href} rel="preload" as="image" href={href} />)}
      </head>
      <body>{children}</body>
    </html>
  );
}
