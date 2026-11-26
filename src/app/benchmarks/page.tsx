import type { Metadata } from "next";
import Link from "next/link";
import {
  DIMENSIONS,
  INTELLIGENCE_VERSION,
  dimensionLeader,
  models,
} from "@/data/models";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "评测方法与数据说明",
  description: `了解模型视界如何收集 ${models.length} 款 AI 模型的智能指数、七维能力、API 价格与速度，以及这些数字的局限。`,
  alternates: alternatesFor("/benchmarks/"),
};

const indexBenchmarks = [
  "AA-Briefcase v1.1",
  "AutomationBench-AA",
  "Terminal-Bench 4.1",
  "FrontierCode-AA 2.0",
  "AA-Omniscience v1.1",
  "GDP.pdf",
  "HLE-Diamond",
  "CritPt v2 (Hard)",
  "Terminal-Bench-Science 0.1",
];

export default function BenchmarksPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <p className="eyebrow">Methodology · {SITE.dataDate}</p>
          <h1>数字从哪里来，又意味着什么</h1>
          <p>
            本站不是评测机构，也不生产分数。我们做的是把公开、可追溯的测量结果
            放在同一套口径下，并明确告诉你哪些比较是有效的、哪些需要保留。
          </p>
          <div className="page-hero-meta">
            <span>综合指数 {INTELLIGENCE_VERSION}</span>
            <span>{models.length} 款模型</span>
            <span>7 个能力维度</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="shell">
          <div className="method-grid">
            <div className="prose">
              <h2>综合智能指数</h2>
              <p>
                综合智能指数来自{" "}
                <a href={SITE.sourceUrl} target="_blank" rel="noreferrer">
                  Artificial Analysis
                </a>{" "}
                的 {INTELLIGENCE_VERSION}。它不是单一考试，而是把 9 项评测标准化后
                加权得到的 0–100 分数，用来粗略回答「哪一档模型更聪明」。
              </p>
              <div className="bench-table" style={{ margin: "18px 0 24px" }}>
                <table>
                  <caption className="visually-hidden">
                    综合智能指数包含的 9 项评测
                  </caption>
                  <tbody>
                    {indexBenchmarks.map((benchmark) => (
                      <tr key={benchmark}>
                        <td style={{ width: "50%" }}>
                          <b>{benchmark}</b>
                        </td>
                        <td style={{ color: "var(--faint)" }}>
                          Intelligence Index 组成项
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2>七个能力维度</h2>
              <p>
                页面上的雷达与矩阵使用七个独立基准，都保留原始通过率（0–100），
                不做跨维度归一化。不同维度的分数不能相加，也不能简单平均成
                「综合能力」。
              </p>

              <div className="panel" style={{ margin: "18px 0 26px" }}>
                <div className="bench-table">
                  <table>
                    <caption className="visually-hidden">
                      七个能力维度的基准与当前领先者
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">维度</th>
                        <th scope="col">基准</th>
                        <th scope="col">衡量什么</th>
                        <th scope="col">当前最高</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DIMENSIONS.map((dimension) => {
                        const leader = dimensionLeader(dimension.key);
                        return (
                          <tr key={dimension.key}>
                            <td>
                              <b>{dimension.label}</b>
                            </td>
                            <td>
                              <span>{dimension.benchmark}</span>
                            </td>
                            <td style={{ color: "var(--muted)" }}>
                              {dimension.description}
                            </td>
                            <td>
                              <b>{leader.name}</b>
                              <span>
                                {leader.scores[dimension.key].toFixed(1)} / 100
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <h2>取数规则</h2>
              <ul>
                <li>
                  <strong>同一档位：</strong>每款模型取 Artificial Analysis 收录的
                  最高推理档位（max / xhigh / high），因此分数、价格与速度都对应
                  能力上限，而不是默认配置。
                </li>
                <li>
                  <strong>价格：</strong>使用官方 API 标价，单位为美元 / 百万
                  tokens（输入 / 输出），不含缓存、批处理与长上下文溢价。
                </li>
                <li>
                  <strong>单任务成本：</strong>来自 AA 对 Intelligence Index 任务的
                  实测消耗，受推理长度影响，只适合做量级比较。
                </li>
                <li>
                  <strong>速度：</strong>输出 tokens / 秒，是 AA 的测量值；不同
                  Provider 与区域会有差异。
                </li>
                <li>
                  <strong>开源：</strong>「开源权重」指权重可下载；不等于训练数据、
                  训练代码或许可证完全开放。
                </li>
                <li>
                  <strong>时间：</strong>快照为 {SITE.dataDate}。模型与价格更新很快，
                  引用前请回查原始来源。
                </li>
              </ul>

              <h2>这些数字不能告诉你什么</h2>
              <div className="callout">
                <span className="callout-mark">!</span>
                <p>
                  基准分数是<strong>受控任务上的平均表现</strong>，不是你的业务效果。
                  提示词、工具、检索、上下文长度、推理预算与 judge 都会改变结果；
                  同一模型在不同 Provider 上的表现也可能不同。把榜单当作筛选器，
                  最终用你自己的任务做小样本验证。
                </p>
              </div>

              <h2>数据来源</h2>
              <ul>
                <li>
                  <a href={SITE.sourceUrl} target="_blank" rel="noreferrer">
                    Artificial Analysis
                  </a>{" "}
                  —— 综合智能指数、七维基准、价格、速度与单任务成本。
                </li>
                <li>
                  <a
                    href="https://openai.com/news/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    OpenAI News
                  </a>
                  、
                  <a
                    href="https://www.anthropic.com/news"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Anthropic News
                  </a>
                  、
                  <a
                    href="https://deepmind.google/blog/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google DeepMind Blog
                  </a>{" "}
                  —— 模型发布、能力声明与研究进展。
                </li>
                <li>
                  其余厂商官方博客与模型卡，链接见各模型详情页与
                  <Link href="/news/">动态页</Link>。
                </li>
              </ul>
            </div>

            <aside className="method-card">
              <h3>Snapshot</h3>
              <p className="big-num">{SITE.dataDate.replaceAll("-", ".")}</p>
              <p>
                {models.length} 款模型，10 家厂商。数据为静态快照，构建时写入页面，
                不依赖后端或实时 API。
              </p>
              <p>
                本站与所列厂商无隶属关系；分数与商标归各自所有者。
              </p>
              <Link className="section-link" href="/models/">
                查看数据 →
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}