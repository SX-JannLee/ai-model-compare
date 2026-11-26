import { news } from "@/data/news";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function GET() {
  const items = news
    .map(
      (item) => `    <item>
      <title>${escape(item.title)}</title>
      <link>${escape(item.url)}</link>
      <guid isPermaLink="true">${escape(item.url)}</guid>
      <pubDate>${new Date(`${item.date}T00:00:00+08:00`).toUTCString()}</pubDate>
      <category>${escape(item.tag)}</category>
      <description>${escape(item.summary)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(SITE.name)} · 最新动态</title>
    <link>${escape(absoluteUrl("/news/"))}</link>
    <description>${escape("来自官方渠道的前沿 AI 模型发布与研究动态。")}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date(`${SITE.dataDate}T00:00:00+08:00`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}