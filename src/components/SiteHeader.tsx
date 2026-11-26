import Link from "next/link";
import { SITE } from "@/lib/site";

const nav = [
  { href: "/", label: "总览" },
  { href: "/models/", label: "模型库" },
  { href: "/compare/", label: "对比" },
  { href: "/benchmarks/", label: "评测方法" },
  { href: "/news/", label: "动态" },
];

function Mark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9L12 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M12 7.2 16.6 9.9v5.4L12 18l-4.6-2.7V9.9L12 7.2Z"
        fill="currentColor"
        opacity=".9"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label={`${SITE.name} 首页`}>
          <Mark />
          <span className="brand-name">{SITE.name}</span>
          <span className="brand-en">{SITE.nameEn}</span>
        </Link>

        <nav className="site-nav" aria-label="主导航">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          className="header-repo"
          href={SITE.repo}
          target="_blank"
          rel="noreferrer"
        >
          GitHub <span aria-hidden="true">↗</span>
        </a>

        <details className="mobile-nav">
          <summary aria-label="打开导航菜单">菜单</summary>
          <div className="mobile-nav-panel">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <a href={SITE.repo} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}