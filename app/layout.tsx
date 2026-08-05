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
    images: [{ url: "/og.png", width: 1680, height: 945, alt: "马梦圆视觉设计作品集" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "马梦圆 | 视觉设计与 AIGC 作品集",
    description: "品牌视觉、UI、文创与 AIGC 设计作品。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
