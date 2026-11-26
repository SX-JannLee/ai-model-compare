import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  variable: "--font-space",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  keywords: [
    "AI 模型对比",
    "AI 模型选型",
    "大模型排行榜",
    "AI 模型评测",
    "LLM benchmark",
    "Artificial Analysis",
    "模型价格",
  ],
  alternates: alternatesFor("/"),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: absoluteUrl("/"),
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: absoluteUrl("/og.png"),
        width: 1200,
        height: 630,
        alt: "模型视界 · 前沿 AI 模型能力对比",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: [absoluteUrl("/og.png")],
  },
  robots: { index: true, follow: true },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: SITE.nameEn,
  url: absoluteUrl("/"),
  description: SITE.description,
  inLanguage: "zh-CN",
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    url: absoluteUrl("/"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={spaceGrotesk.variable}>
      <body>
        <a className="skip-link" href="#main">
          跳到主要内容
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <noscript>
          <div className="noscript">
            本站图表由静态 HTML 与轻量 JavaScript 渲染。关闭 JavaScript
            仍可阅读全部文字与数据表。{" "}
            <Link href="/models/">前往模型数据表</Link>。
          </div>
        </noscript>
      </body>
    </html>
  );
}