import type { Metadata } from "next";
import Link from "next/link";
import { ModelMatch } from "@/components/ModelMatch";
import { SectionHead } from "@/components/ui";
import { DIMENSIONS, models } from "@/data/models";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";
import styles from "./match.module.css";

export const metadata: Metadata = {
  title: "选型向导",
  description: `用主要任务、预算偏好、上下文需求与开源权重四个条件，从 ${models.length} 款前沿模型中推荐匹配度最高的 3 款。评分可解释，结果 URL 可分享。数据快照 ${SITE.dataDate}。`,
  alternates: alternatesFor("/match/"),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: `选型向导 · ${SITE.name}`,
      url: absoluteUrl("/match/"),
      description: `按任务、预算、上下文与开源权重筛选并排序 ${models.length} 款前沿 AI 模型，给出可解释的前三名推荐。`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      inLanguage: "zh-CN",
      isPartOf: {
        "@type": "WebSite",
        name: SITE.name,
        url: absoluteUrl("/"),
      },
      dateModified: SITE.dataDate,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "按任务维度加权能力分",
        "按预算调整成本权重",
        "按上下文窗口筛选",
        "仅看开源权重",
        "可分享的 URL 状态",
      ],
    },
    {
      "@type": "ItemList",
      name: "选型向导候选模型",
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

export default function MatchPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <p className="eyebrow">Model Match · 从看榜到选型</p>
          <h1>从看榜，到选型</h1>
          <p>
            四个偏好，把 {models.length} 款前沿模型收窄成一份可解释的短名单：
            先按任务与预算算匹配分，再按上下文与权重过滤。每个推荐都告诉你
            它赢在哪里、贵在哪里，而不是只给一个「最强」。
          </p>
          <div className="page-hero-meta">
            <span>{models.length} 款候选</span>
            <span>{DIMENSIONS.length} 个能力维度</span>
            <span>成本权重 10–45%</span>
            <span>快照 {SITE.dataDate}</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="shell">
          <ModelMatch />
        </div>
      </section>

      <section className="section" id="method">
        <div className="shell">
          <SectionHead
            no="01"
            title="评分口径"
            desc="偏好只改变排序与候选池，不改变原始数据。下面每一个数字都可以按同一套公式复算。"
            linkHref="/benchmarks/"
            linkLabel="完整评测方法"
          />

          <div className="method-grid">
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">匹配分如何计算</span>
                <span className="panel-sub">0–100 · Transparent</span>
              </div>
              <div className="panel-body">
                <div className={styles.tableScroll}>
                  <table className="bench-table">
                    <thead>
                      <tr>
                        <th scope="col">项目</th>
                        <th scope="col">规则</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">能力分</th>
                        <td>
                          <b>综合均衡</b>时直接使用综合智能指数；
                          选定具体任务时用{" "}
                          <code className={styles.formula}>
                            0.6 × 任务维度 + 0.4 × 综合智能
                          </code>
                          ，避免单一基准主导结论。
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">性价比分</th>
                        <td>
                          对全部 {models.length} 款模型的单任务成本做对数反向归一化：
                          <code className={styles.formula}>
                            100 × (ln(最高成本) − ln(本模型成本)) ÷ (ln(最高成本) −
                            ln(最低成本))
                          </code>
                          最便宜约 100 分，最贵约 0 分。筛选不会重新计算这个分母。
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">匹配分</th>
                        <td>
                          <code className={styles.formula}>
                            round((1 − w) × 能力分 + w × 性价比分, 1)
                          </code>
                          <span>
                            w 为成本权重：能力优先 0.10、均衡 0.25、性价比优先
                            0.45。
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">先筛后排</th>
                        <td>
                          先按「只看开源权重」与上下文下限（≥ 200K 或 ≥ 1M）
                          过滤，再在剩余候选中排序。通过筛选的模型不足 3
                          款时，展示全部通过者。
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">并列规则</th>
                        <td>
                          匹配分相同按综合智能降序，再按单任务成本升序；
                          仍然相同则按 slug 稳定排序，保证同一 URL 结果一致。
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={`callout ${styles.methodCallout}`}>
                  <span className="callout-mark">!</span>
                  <p>
                    <strong>分数是决策辅助，不是结论。</strong>
                    数据是 {SITE.dataDate} 的静态快照，评分只使用综合智能、七个任务维度与
                    单任务成本，无法覆盖你的私有数据、延迟要求、合规约束与调用方式。
                    确定短名单后，请用真实任务做一轮小样本评测，再决定是否上线。
                  </p>
                </div>
              </div>
            </div>

            <aside className="method-card">
              <h3>Snapshot</h3>
              <p className="big-num">{SITE.dataDate.slice(5).replace("-", ".")}</p>
              <p>
                {models.length} 款模型、{DIMENSIONS.length} 个能力维度与官方 API
                标价，全部冻结在 {SITE.dataDate}。本站不提供实时价格或新模型追踪。
              </p>
              <p>
                价格为每百万 tokens 的输入 / 输出标价；单任务成本来自 Artificial
                Analysis 的 Intelligence Index 口径，实际账单会受缓存、批处理与
                推理长度影响。
              </p>
              <div className={styles.methodLinks}>
                <Link className="section-link" href="/models/">
                  浏览全部模型 →
                </Link>
                <Link className="section-link" href="/compare/">
                  自由叠加对比 →
                </Link>
              </div>
            </aside>
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