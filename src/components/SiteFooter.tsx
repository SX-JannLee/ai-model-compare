import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <p className="footer-name">
            {SITE.name}
            <span>{SITE.nameEn}</span>
          </p>
          <p className="footer-desc">
            一个独立、无后端的前沿 AI 模型数据项目。用统一口径的能力分数、
            API 价格与速度，帮助你看清模型之间的真实差距。
          </p>
        </div>

        <div className="footer-col">
          <p className="footer-label">浏览</p>
          <Link href="/models/">模型库</Link>
          <Link href="/match/">选型向导</Link>
          <Link href="/compare/">模型对比</Link>
          <Link href="/benchmarks/">评测方法</Link>
          <Link href="/news/">最新动态</Link>
          <Link href="/changelog/">更新日志</Link>
        </div>

        <div className="footer-col">
          <p className="footer-label">数据</p>
          <a href={SITE.sourceUrl} target="_blank" rel="noreferrer">
            Artificial Analysis ↗
          </a>
          <a href={SITE.repo} target="_blank" rel="noreferrer">
            GitHub 仓库 ↗
          </a>
          <p className="footer-meta">
            v{SITE.version} · 快照 {SITE.dataDate}
          </p>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>
          © {new Date().getFullYear()} {SITE.name}。与所列模型厂商无隶属关系。
        </p>
        <p>
          分数来自 {SITE.sourceName} 公开页面，价格与能力可能随厂商更新而变化。
        </p>
      </div>
    </footer>
  );
}