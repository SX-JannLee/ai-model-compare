import type { Metadata } from "next";
import Link from "next/link";
import { IntelligenceBars } from "@/components/IntelligenceBars";
import { PriceScatter } from "@/components/PriceScatter";
import { RadarChart } from "@/components/RadarChart";
import { DimensionMatrix } from "@/components/DimensionMatrix";
import { SectionHead, VendorDot } from "@/components/ui";
import {
  DIMENSIONS,
  formatPrice,
  formatDate,
  getModel,
  models,
  vendorColor,
} from "@/data/models";
import { news } from "@/data/news";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} · ${SITE.tagline}`,
  description: SITE.description,
  alternates: alternatesFor("/"),
};

const top = models[0];
const topFive = models.slice(0, 5);
const valuePick = getModel("gpt-6-2-sol")!;
const openPick = getModel("kimi-k3-1-pro")!;
const fastest = [...models].sort((a, b) => b.speed - a.speed)[0];
const cheapest = [...models].sort((a, b) => a.costPerTask - b.costPerTask)[0];
const contextCount = models.filter((model) => model.contextK >= 1000).length;

const radarSeries = [
  { model: top, color: vendorColor(top.vendor) },
  { model: valuePick, color: vendorColor(valuePick.vendor) },
  { model: openPick, color: vendorColor(openPick.vendor) },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      name: `${SITE.name} · 前沿 AI 模型能力对比数据`,
      description: SITE.description,
      url: absoluteUrl("/"),
      dateModified: SITE.dataDate,
      inLanguage: "zh-CN",
      creator: { "@type": "Organization", name: SITE.name },
      isBasedOn: SITE.sourceUrl,
      variableMeasured: [
        { "@type": "PropertyValue", name: "综合智能指数" },
        ...DIMENSIONS.map((dimension) => ({
          "@type": "PropertyValue",
          name: dimension.label,
          description: dimension.description,
        })),
      ],
    },
    {
      "@type": "ItemList",
      name: "前沿 AI 模型列表",
      numberOfItems: models.length,
      itemListElement: models.map((model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: model.name,
        url: absoluteUrl(`/models/${model.slug}/`),
      })),
    },
  ],
};

const tickerItems = [
  `v${SITE.version} 上线 · 选型向导 + 可分享对比`,
  `综合第一 ${top.name} · ${top.intelligence.toFixed(1)}`,
  `开源第一 ${openPick.name} · ${openPick.intelligence.toFixed(1)}`,
  `单任务成本最低 ${cheapest.name} · $${cheapest.costPerTask.toFixed(2)}`,
  `输出最快 ${fastest.name} · ${fastest.speed} tok/s`,
  `1M 上下文 · ${contextCount}/${models.length} 款达到`,
  `数据快照 ${SITE.dataDate} · ${SITE.sourceName}`,
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Frontier AI Index · v{SITE.version}</p>
            <h1>
              <span className="line">看清前沿模型</span>
              <span className="line accent">的真实差距</span>
            </h1>
            <p className="lede">
              汇总 {models.length} 款前沿大模型、{DIMENSIONS.length} 个能力维度与真实
              API 价格。先看清谁最强、谁最值，再按任务、预算与上下文，
              三步选出最适合你的那一款。
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/match/">
                三步选型 <span aria-hidden="true">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/models/">
                查看完整榜单
              </Link>
            </div>
            <p className="hero-meta">
              <span>数据快照 {SITE.dataDate}</span>
              <span>{models.length} 款模型 / 10 家厂商</span>
              <span>v{SITE.version}</span>
              <span>来源 {SITE.sourceName}</span>
            </p>
          </div>

          <aside className="hero-card" aria-label="综合智能前五名">
            <div className="card-head">
              <span>Intelligence · Top 5</span>
              <span className="live">Data snapshot</span>
            </div>
            <ol className="podium">
              {topFive.map((model, index) => (
                <li key={model.slug}>
                  <Link className="podium-row" href={`/models/${model.slug}/`}>
                    <span className="podium-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="podium-name">
                      <VendorDot vendor={model.vendor} size={7} />
                      <b>{model.name}</b>
                    </span>
                    <span className="podium-track" aria-hidden="true">
                      <span
                        className="podium-fill"
                        style={{
                          width: `${(model.intelligence / top.intelligence) * 100}%`,
                          background: vendorColor(model.vendor),
                        }}
                      />
                    </span>
                    <span className="podium-score">
                      {model.intelligence.toFixed(1)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="hero-card-foot">
              <span>9 项评测加权，同一套口径</span>
              <Link href="/models/">全部 {models.length} 款 →</Link>
            </div>
          </aside>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span className="ticker-item" key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="section" id="ranking">
        <div className="shell">
          <SectionHead
            no="01"
            title="智能排行榜"
            desc="Artificial Analysis Intelligence Index v5.0.2，综合 9 项评测；同一模型取最高推理档位。"
            linkHref="/models/"
            linkLabel="完整模型库"
          />
          <div className="split">
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">综合智能指数</span>
                <span className="panel-sub">0–100 · Higher is better</span>
              </div>
              <div className="panel-body">
                <IntelligenceBars />
                <p className="note">
                  智能指数是 9 项基准的加权结果，不能替代针对具体任务的评测。
                  点击任意模型查看七维能力与完整指标。
                </p>
              </div>
            </div>

            <div className="insight-list">
              <div className="insight-card">
                <p className="insight-kicker">榜首 · Champion</p>
                <p className="insight-value">
                  {top.intelligence.toFixed(1)}
                  <small> / 100</small>
                </p>
                <p className="insight-text">
                  <strong>{top.name}</strong> 在推理、知识、编程、长文与科学五个维度同时
                  第一，领先第二名 {(top.intelligence - models[1].intelligence).toFixed(1)} 分。
                </p>
              </div>
              <div className="insight-card">
                <p className="insight-kicker">性价比 · Value</p>
                <p className="insight-value">
                  ${valuePick.costPerTask.toFixed(2)}
                  <small> / 任务</small>
                </p>
                <p className="insight-text">
                  <strong>{valuePick.name}</strong> 以 {formatPrice(valuePick)} 的价格
                  拿到 {valuePick.intelligence.toFixed(1)} 分，单位成本能力约为榜首的 26 倍。
                </p>
              </div>
              <div className="insight-card">
                <p className="insight-kicker">开源 · Open weights</p>
                <p className="insight-value">
                  {openPick.scores.agentic}
                  <small> 智能体</small>
                </p>
                <p className="insight-text">
                  <strong>{openPick.name}</strong> 综合 {openPick.intelligence.toFixed(1)}
                  位列开源第一；智能体得分全榜最高，文档任务同样领先。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="match">
        <div className="shell">
          <SectionHead
            no="02"
            title="从榜单到选型"
            desc="分数回答谁更强；选型还要回答做什么、花多少、上下文多长。三步收敛到 3 个候选，每个都给出理由。"
            linkHref="/match/"
            linkLabel="打开选型向导"
          />
          <div className="match-teaser">
            <div className="match-teaser-copy">
              <p className="eyebrow">Model Match · v{SITE.version}</p>
              <h3>不选「最强」，选「最适合」。</h3>
              <p>
                把任务重点、预算敏感度、上下文长度和开源偏好交给选型向导，
                得到带理由的前三名；一键带入对比页，把推荐继续看细。
              </p>
              <div className="match-teaser-actions">
                <Link className="btn btn-primary btn-small" href="/match/">
                  开始三步选型 <span aria-hidden="true">→</span>
                </Link>
                <span className="match-teaser-note">
                  无需登录 · 浏览器本地计算
                </span>
              </div>
            </div>
            <ol className="match-steps">
              <li className="match-step">
                <span className="match-step-no">01</span>
                <b>选任务</b>
                <p>编程、推理、智能体、长文……在七维能力里挑出重点。</p>
              </li>
              <li className="match-step">
                <span className="match-step-no">02</span>
                <b>定约束</b>
                <p>预算敏感度、上下文窗口，以及是否只看开源权重。</p>
              </li>
              <li className="match-step">
                <span className="match-step-no">03</span>
                <b>得候选</b>
                <p>返回匹配度最高的 3 款，附评分理由与下一步链接。</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section" id="value">
        <div className="shell">
          <SectionHead
            no="03"
            title="价格 × 能力"
            desc="横轴是每百万输出 tokens 的价格（对数刻度），纵轴是综合智能。越靠左上，单位价格换来的能力越多。"
            linkHref="/models/"
            linkLabel="按价格排序"
          />
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">效率前沿</span>
              <span className="panel-sub">Output price · USD / 1M tokens</span>
            </div>
            <div className="panel-body">
              <PriceScatter />
              <div className="callout">
                <span className="callout-mark">↗</span>
                <p>
                  <strong>GPT-6.2 Sol 是曲线上的拐点：</strong>
                  $10 的输出价格买到 57.3 分，单任务成本约 $1.01；再往上，
                  每提升 1 分智能的边际价格迅速上升。预算有限时，它比旗舰更值得先试。
                </p>
              </div>
              <p className="note">
                虚线连接「效率前沿」：在相同或更低价格下没有被其他模型同时超越的点。
                价格为首方 API 标价，实际账单会受缓存、批处理与推理长度影响。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="capability">
        <div className="shell">
          <SectionHead
            no="04"
            title="能力雷达"
            desc="七个维度都是 0–100 的原始通过率，不做跨维度归一化。把三款代表模型叠在一起，缺口就是差异。"
            linkHref="/compare/"
            linkLabel="自由叠加对比"
          />
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">三种选择，三种取舍</span>
              <span className="panel-sub">7 dimensions · 0–100</span>
            </div>
            <div className="panel-body">
              <div className="radar-layout">
                <div className="radar-wrap">
                  <RadarChart series={radarSeries} />
                </div>
                <div className="radar-legend">
                  {radarSeries.map(({ model, color }) => (
                    <div className="radar-key" key={model.slug}>
                      <span
                        className="dot"
                        style={{ background: color }}
                        aria-hidden="true"
                      />
                      <span className="radar-key-name">
                        {model.name}
                        <small>{model.tagline}</small>
                      </span>
                      <span className="radar-key-score">
                        {model.intelligence.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  <p className="radar-note">
                    Fable 5.2 的知识与科学面明显外扩；Sol 在文档任务上更均衡；
                    Kimi 的智能体与文档能力突出，但科学推理收缩明显。没有全能模型，
                    只有与任务匹配的模型。
                  </p>
                  <Link className="btn btn-ghost btn-small" href="/compare/">
                    选择自己的组合 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="matrix">
        <div className="shell">
          <SectionHead
            no="05"
            title="维度矩阵"
            desc="把 16 款模型 × 7 个维度摊开。颜色只表示相对强弱，具体数值才是判断依据。"
            linkHref="/benchmarks/"
            linkLabel="评测口径"
          />
          <DimensionMatrix />
        </div>
      </section>

      <section className="section" id="news">
        <div className="shell">
          <SectionHead
            no="06"
            title="最新动态"
            desc="只收录模型厂商与官方研究博客，附原文链接。快照之外的变化，以来源为准。"
            linkHref="/news/"
            linkLabel="全部动态"
          />
          <div className="news-list">
            {news.slice(0, 4).map((item) => (
              <a
                className="news-item"
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                <time className="news-date" dateTime={item.date}>
                  {formatDate(item.date)}
                </time>
                <div className="news-body">
                  <p className="news-source">
                    {item.source}
                    <span className="news-tag">{item.tag}</span>
                  </p>
                  <p className="news-title">{item.title}</p>
                  <p className="news-summary">{item.summary}</p>
                </div>
                <span className="news-arrow" aria-hidden="true">
                  阅读原文 ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="method">
        <div className="shell">
          <SectionHead
            no="07"
            title="我们如何比较"
            desc="同一套指数、同一时点的价格、最高推理档位。所有数字都可以回溯到公开来源。"
            linkHref="/benchmarks/"
            linkLabel="完整方法"
          />
          <div className="split">
            <div className="prose">
              <p>
                本站把 {models.length} 款模型放在同一张表上，核心指标来自{" "}
                <a href={SITE.sourceUrl} target="_blank" rel="noreferrer">
                  Artificial Analysis
                </a>{" "}
                公开页面：综合智能指数、七项能力基准、API 价格、输出速度与单任务成本。
                每款模型取 AA 收录的<strong>最高推理档位</strong>，因此比较的是能力上限，
                而不是默认配置。
              </p>
              <p>
                我们不做二次归一化，也不把不同基准拼成一个「万能分数」。页面上的雷达与
                矩阵保留原始通过率，方便你按任务选模型。价格是标价，实际成本取决于
                缓存、推理长度与批处理折扣。
              </p>
            </div>
            <div className="method-card">
              <h3>Snapshot</h3>
              <p className="big-num">v5.0.2</p>
              <p>
                Intelligence Index 由 9 项评测加权：AA-Briefcase、AutomationBench、
                Terminal-Bench 4.1、FrontierCode 2.0、AA-Omniscience、GDP.pdf、
                HLE-Diamond、CritPt v2 与 Terminal-Bench-Science。
              </p>
              <Link className="section-link" href="/benchmarks/">
                查看基准明细 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}