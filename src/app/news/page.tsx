import type { Metadata } from "next";
import { formatDate } from "@/data/models";
import { news } from "@/data/news";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "最新动态",
  description:
    "来自 OpenAI、Anthropic、Google DeepMind、xAI、DeepSeek、Kimi、Mistral 等官方渠道的前沿 AI 新闻与模型发布，附原文链接。",
  alternates: alternatesFor("/news/"),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${SITE.name} · 最新 AI 动态`,
  numberOfItems: news.length,
  itemListElement: news.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    url: item.url,
  })),
};

export default function NewsPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <p className="eyebrow">Signal · Official sources only</p>
          <h1>只收官方信源的前沿动态</h1>
          <p>
            模型发布、能力声明与关键研究。每条都附原文链接；标题可以摘要，
            数字以官方原文为准。
          </p>
          <div className="page-hero-meta">
            <span>{news.length} 条记录</span>
            <span>截至 {SITE.dataDate}</span>
            <span>官方博客 / 新闻室</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="shell">
          <div className="news-list">
            {news.map((item) => (
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
                  原文 ↗
                </span>
              </a>
            ))}
          </div>
          <p className="note">
            收录范围：与模型能力、价格或评测直接相关的官方内容。厂商营销与
            合作伙伴公告通常不收录。若链接失效，可在对应厂商新闻室检索标题。
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}