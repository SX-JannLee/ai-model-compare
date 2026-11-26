import type { Metadata } from "next";
import Link from "next/link";
import { DIMENSIONS, formatDate, models } from "@/data/models";
import { releaseAnchor, releases } from "@/data/changelog";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";
import styles from "./changelog.module.css";

const current = releases[0];

export const metadata: Metadata = {
  title: "更新日志",
  description: `模型视界 ${SITE.version} 更新日志：v1.1 新增选型向导与可分享对比，v1.0 首发 ${models.length} 款模型 × ${DIMENSIONS.length} 个维度。数据为 ${SITE.dataDate} 静态快照。`,
  alternates: alternatesFor("/changelog/"),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "更新日志",
      description: `模型视界版本记录，当前版本 v${SITE.version}，数据快照 ${SITE.dataDate}。`,
      url: absoluteUrl("/changelog/"),
      dateModified: SITE.releaseDate,
      version: SITE.version,
      inLanguage: "zh-CN",
      isPartOf: {
        "@type": "WebSite",
        name: SITE.name,
        url: absoluteUrl("/"),
      },
    },
    {
      "@type": "ItemList",
      name: "模型视界版本记录",
      itemListElement: releases.map((release, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `v${release.version} · ${release.title}`,
        url: absoluteUrl(`/changelog/#${releaseAnchor(release.version)}`),
      })),
    },
  ],
};

// Escape the JSON payload so the inline script can never be closed early.
const jsonLdHtml = JSON.stringify(jsonLd)
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026");

export default function ChangelogPage() {
  return (
    <>
      <header className={`page-hero ${styles.hero}`}>
        <div className={`shell ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">Changelog · v1.1</p>
            <h1>
              从看榜
              <span className={styles.heroBreak}>到选型</span>
            </h1>
            <p className={styles.lede}>
              模型视界用语义化版本记录每一次可见的变化：次版本代表新增的页面与能力，
              修订版本只做修正。这里的每个版本都对应一次静态构建，没有后台悄悄上线，
              也没有看不见的数据更新。
            </p>
            <div className={styles.heroActions}>
              <Link className="btn btn-primary" href="/match/">
                试试选型向导 <span aria-hidden="true">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/compare/">
                打开对比页
              </Link>
            </div>
          </div>

          <aside
            className={styles.versionCard}
            aria-label={`当前版本 v${SITE.version}`}
          >
            <p className={styles.versionLabel}>Current release</p>
            <p className={styles.versionNumber}>v{SITE.version}</p>
            <dl className={styles.versionMeta}>
              <div>
                <dt>发布日期</dt>
                <dd>
                  <time dateTime={SITE.releaseDate}>
                    {formatDate(SITE.releaseDate)}
                  </time>
                </dd>
              </div>
              <div>
                <dt>数据快照</dt>
                <dd>{formatDate(SITE.dataDate)}</dd>
              </div>
              <div>
                <dt>数据状态</dt>
                <dd>静态快照</dd>
              </div>
            </dl>
            <p className={styles.versionNote}>
              版本更新的是站点能力，榜单数字仍取自 {SITE.sourceName} 的公开页面。
            </p>
            <Link className={styles.versionLink} href="/benchmarks/">
              数据口径与来源 →
            </Link>
          </aside>
        </div>
      </header>

      <section className="section" aria-labelledby="releases-title">
        <div className="shell">
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>Release notes</p>
            <h2 id="releases-title" className={styles.sectionTitle}>
              版本记录
            </h2>
            <p className={styles.sectionDesc}>
              按时间倒序排列。点击版本号可定位到该版本，复制地址栏链接即可分享。
            </p>
          </div>

          <ol className={styles.timeline}>
            {releases.map((release, index) => {
              const anchor = releaseAnchor(release.version);
              return (
                <li className={styles.release} id={anchor} key={release.version}>
                  <div className={styles.rail} aria-hidden="true">
                    <span className={styles.railDot} />
                    <span className={styles.railLine} />
                  </div>

                  <article
                    className={styles.card}
                    aria-labelledby={`${anchor}-title`}
                  >
                    <div className={styles.cardTop}>
                      <a
                        className={styles.anchor}
                        href={`#${anchor}`}
                        aria-label={`链接到 v${release.version}`}
                      >
                        v{release.version}
                      </a>
                      {index === 0 ? (
                        <span className={styles.currentBadge}>当前版本</span>
                      ) : null}
                      <time
                        className={styles.releaseDate}
                        dateTime={release.date}
                      >
                        {formatDate(release.date)}
                      </time>
                    </div>

                    <h3 id={`${anchor}-title`} className={styles.releaseTitle}>
                      {release.title}
                    </h3>
                    <p className={styles.releaseSummary}>{release.summary}</p>

                    <h4 className={styles.subhead}>亮点</h4>
                    <ul className={styles.highlights}>
                      {release.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>

                    {release.fixes && release.fixes.length > 0 ? (
                      <>
                        <h4 className={styles.subhead}>修复与打磨</h4>
                        <ul className={`${styles.highlights} ${styles.fixes}`}>
                          {release.fixes.map((fix) => (
                            <li key={fix}>{fix}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    {release.links && release.links.length > 0 ? (
                      <nav
                        className={styles.links}
                        aria-label={`v${release.version} 相关页面`}
                      >
                        {release.links.map((link) => (
                          <Link
                            className={styles.link}
                            href={link.href}
                            key={link.href}
                          >
                            {link.label} <span aria-hidden="true">→</span>
                          </Link>
                        ))}
                      </nav>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="scope-title">
        <div className="shell">
          <div className={styles.scope}>
            <div className={styles.scopeCopy}>
              <p className={styles.sectionKicker}>Data &amp; scope</p>
              <h2 id="scope-title" className={styles.sectionTitle}>
                数据与口径
              </h2>
              <p>
                版本更新的是站点能力，不是榜单数字。综合智能指数、七维能力、API
                价格与速度均来自{" "}
                <a href={SITE.sourceUrl} target="_blank" rel="noreferrer">
                  Artificial Analysis
                </a>{" "}
                的公开页面；本站不做独立评测，也不生产分数。
              </p>
              <p>
                数据快照固定为{" "}
                <time dateTime={SITE.dataDate}>{SITE.dataDate}</time>
                ，在构建时写入页面。它是静态快照，不是实时数据；模型发布、价格调整
                或基准版本变化后，需要重新取数并重新构建，本站不会自动跟随。
              </p>
            </div>

            <div className={styles.scopeCard}>
              <p className={styles.scopeLabel}>Snapshot</p>
              <p className={styles.scopeDate}>
                {formatDate(SITE.dataDate)}
              </p>
              <dl className={styles.scopeMeta}>
                <div>
                  <dt>站点版本</dt>
                  <dd>v{SITE.version}</dd>
                </div>
                <div>
                  <dt>当前条目</dt>
                  <dd>v{current.version}</dd>
                </div>
                <div>
                  <dt>更新方式</dt>
                  <dd>静态构建</dd>
                </div>
              </dl>
              <Link className={styles.versionLink} href="/benchmarks/">
                查看完整评测方法 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
      />
    </>
  );
}