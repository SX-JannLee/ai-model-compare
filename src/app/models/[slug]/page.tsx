import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RadarChart } from "@/components/RadarChart";
import { SectionHead, VendorDot } from "@/components/ui";
import {
  DIMENSIONS,
  INTELLIGENCE_VERSION,
  dimensionLeader,
  formatContext,
  formatDate,
  formatPrice,
  getModel,
  modelRank,
  models,
  VENDOR_LABELS,
  vendorColor,
} from "@/data/models";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return models.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = getModel(slug);
  if (!model) return {};

  const title = `${model.name} 评测与价格`;
  const description = `${model.vendor} ${model.name}：综合智能 ${model.intelligence}，价格 ${formatPrice(model)}，上下文 ${formatContext(model.contextK)}，输出 ${model.speed} tok/s。${model.summary}`;

  return {
    title,
    description,
    alternates: alternatesFor(`/models/${slug}/`),
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url: absoluteUrl(`/models/${slug}/`),
      type: "article",
    },
  };
}

function relatedModels(slug: string) {
  const index = models.findIndex((model) => model.slug === slug);
  const model = models[index];
  const candidates = [
    models[index - 1],
    models[index + 1],
    ...models.filter(
      (item) => item.vendor === model.vendor && item.slug !== model.slug,
    ),
  ].filter(Boolean) as typeof models;

  const seen = new Set<string>();
  return candidates.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  }).slice(0, 3);
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = getModel(slug);
  if (!model) notFound();

  const rank = modelRank(model.slug);
  const color = vendorColor(model.vendor);
  const related = relatedModels(model.slug);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "模型库",
        item: absoluteUrl("/models/"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.name,
        item: absoluteUrl(`/models/${model.slug}/`),
      },
    ],
  };

  return (
    <>
      <div className="shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link href="/">首页</Link>
          <span>/</span>
          <Link href="/models/">模型库</Link>
          <span>/</span>
          <span style={{ color: "var(--muted)" }}>{model.name}</span>
        </nav>

        <header className="model-hero" data-rank={`#${String(rank).padStart(2, "0")}`}>
          <div className="model-hero-inner">
            <div className="model-kicker">
              <span className="rank-badge">#{String(rank).padStart(2, "0")}</span>
              <VendorDot vendor={model.vendor} size={8} />
              <span>{VENDOR_LABELS[model.vendor] ?? model.vendor}</span>
              <span>·</span>
              <span>{formatDate(model.releaseDate)} 发布</span>
              <span>·</span>
              <span>{model.openWeights ? "开源权重" : "闭源 API"}</span>
              <span>·</span>
              <span>{model.variant}</span>
            </div>

            <h1 className="model-title">{model.name}</h1>
            <p className="model-sub">{model.summary}</p>

            <div className="model-links">
              {model.officialUrl ? (
                <a
                  className="btn btn-primary btn-small"
                  href={model.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  官方发布 <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              <a
                className="btn btn-ghost btn-small"
                href={model.aaUrl}
                target="_blank"
                rel="noreferrer"
              >
                Artificial Analysis <span aria-hidden="true">↗</span>
              </a>
              <Link className="btn btn-ghost btn-small" href="/compare/">
                加入对比
              </Link>
            </div>

            <dl className="detail-stats">
              <div className="detail-stat">
                <dt>综合智能</dt>
                <dd>
                  {model.intelligence.toFixed(1)}
                  <small> / 100</small>
                </dd>
              </div>
              <div className="detail-stat">
                <dt>价格 / 1M</dt>
                <dd>
                  ${model.priceInput}
                  <small> / ${model.priceOutput}</small>
                </dd>
              </div>
              <div className="detail-stat">
                <dt>上下文</dt>
                <dd>{formatContext(model.contextK)}</dd>
              </div>
              <div className="detail-stat">
                <dt>输出速度</dt>
                <dd>
                  {model.speed}
                  <small> tok/s</small>
                </dd>
              </div>
              <div className="detail-stat">
                <dt>单任务成本</dt>
                <dd>
                  ${model.costPerTask.toFixed(2)}
                  <small> / task</small>
                </dd>
              </div>
            </dl>
          </div>
        </header>
      </div>

      <section className="section">
        <div className="shell">
          <div className="detail-grid">
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">能力雷达</span>
                <span className="panel-sub">0–100 · Raw pass rate</span>
              </div>
              <div className="panel-body">
                <RadarChart
                  series={[{ model, color }]}
                  size={460}
                />
                <p className="note">
                  七个维度使用不同的原始基准，未做跨维度归一化。面积越大不代表
                  综合分越高——请结合具体任务阅读。
                </p>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">维度得分</span>
                <span className="panel-sub">vs. dimension leader</span>
              </div>
              <div className="panel-body">
                <div className="dim-list">
                  {DIMENSIONS.map((dimension) => {
                    const value = model.scores[dimension.key];
                    const leader = dimensionLeader(dimension.key);
                    return (
                      <div className="dim-row" key={dimension.key}>
                        <div className="dim-top">
                          <span className="dim-name">
                            {dimension.label}
                            <small>{dimension.benchmark}</small>
                          </span>
                          <span className="dim-score">
                            {value.toFixed(1)}
                            <small>/100</small>
                          </span>
                        </div>
                        <div className="dim-track">
                          <div
                            className="dim-fill"
                            style={{ width: `${value}%`, background: color }}
                          />
                        </div>
                        <p className="dim-leader">
                          全榜最高：{leader.name} ·{" "}
                          {leader.scores[dimension.key].toFixed(1)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-grid" style={{ marginTop: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">完整指标</span>
                <span className="panel-sub">Snapshot {SITE.dataDate}</span>
              </div>
              <div className="panel-body">
                <table className="metric-table">
                  <caption className="visually-hidden">
                    {model.name} 的价格、上下文、速度与版本信息
                  </caption>
                  <tbody>
                    <tr>
                      <th scope="row">综合智能指数</th>
                      <td>{model.intelligence.toFixed(1)} / 100</td>
                    </tr>
                    <tr>
                      <th scope="row">输入价格</th>
                      <td>${model.priceInput} / 1M tokens</td>
                    </tr>
                    <tr>
                      <th scope="row">输出价格</th>
                      <td>${model.priceOutput} / 1M tokens</td>
                    </tr>
                    <tr>
                      <th scope="row">上下文窗口</th>
                      <td>{model.contextK.toLocaleString()}K tokens</td>
                    </tr>
                    <tr>
                      <th scope="row">输出速度</th>
                      <td>{model.speed} tok/s</td>
                    </tr>
                    <tr>
                      <th scope="row">单任务成本</th>
                      <td>${model.costPerTask.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th scope="row">权重</th>
                      <td>{model.openWeights ? "开源权重" : "闭源"}</td>
                    </tr>
                    <tr>
                      <th scope="row">发布日期</th>
                      <td>{formatDate(model.releaseDate)}</td>
                    </tr>
                    <tr>
                      <th scope="row">评测档位</th>
                      <td>{model.variant}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">数据与解读</span>
                <span className="panel-sub">Sources</span>
              </div>
              <div className="panel-body">
                <p className="note" style={{ marginTop: 0 }}>
                  {model.summary}
                </p>
                <div className="source-box" style={{ marginTop: 16 }}>
                  <p>
                    能力分数与价格来自{" "}
                    <a href={model.aaUrl} target="_blank" rel="noreferrer">
                      Artificial Analysis 模型页
                    </a>
                    ，抓取于 {SITE.dataDate}。综合智能指数版本为{" "}
                    {INTELLIGENCE_VERSION}，由 Artificial Analysis 维护。
                  </p>
                  <p style={{ marginTop: 8 }}>
                    取数口径：同一模型取 AA 收录的最高推理档位（{model.variant}），
                    因此分数代表能力上限，价格与速度也对应这一档位。不同厂商的
                    推理预算与工具调用策略不同，跨模型比较时请保留误差意识。
                  </p>
                  {model.officialUrl ? (
                    <p style={{ marginTop: 8 }}>
                      官方发布：{" "}
                      <a href={model.officialUrl} target="_blank" rel="noreferrer">
                        原文链接
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            no="REL"
            title="同门与相邻"
            desc="排名相邻或来自同一厂商的模型，适合继续比较。"
            linkHref="/models/"
            linkLabel="全部模型"
          />
          <div className="related-grid">
            {related.map((item) => (
              <Link
                className="related-card"
                href={`/models/${item.slug}/`}
                key={item.slug}
              >
                <span className="related-vendor">
                  <VendorDot vendor={item.vendor} size={6} />{" "}
                  {item.vendor} · #{String(modelRank(item.slug)).padStart(2, "0")}
                </span>
                <p className="related-name">{item.name}</p>
                <p className="related-score">
                  {item.intelligence.toFixed(1)}
                  <small>智能</small>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}