export const SITE = {
  name: "模型视界",
  nameEn: "Model Lens",
  tagline: "前沿 AI 模型对比与选型",
  description:
    "汇总 16 款前沿大模型、7 个能力维度与真实 API 价格：看排行榜、比价格与速度，再按任务、预算与上下文三步选出最适合的模型。数据来自 Artificial Analysis 与各厂商公开页面。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sx-jannlee.github.io",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  repo: "https://github.com/SX-JannLee/ai-model-compare",
  version: "1.1.0",
  releaseDate: "2026-11-26",
  dataDate: "2026-11-26",
  sourceName: "Artificial Analysis",
  sourceUrl: "https://artificialanalysis.ai/",
};

export const absoluteUrl = (path = "/"): string => {
  const suffix = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${SITE.basePath}${suffix}`;
};

export const assetUrl = (path: string): string =>
  `${SITE.basePath}${path.startsWith("/") ? path : `/${path}`}`;

export const canonicalFor = (path: string): string => {
  if (path === "/") return `${SITE.url}${SITE.basePath}/`;
  return `${SITE.url}${SITE.basePath}${path}`;
};
/** Canonical + RSS alternate, shared by every route's metadata. */
export const alternatesFor = (path: string) => ({
  canonical: absoluteUrl(path),
  types: {
    "application/rss+xml": absoluteUrl("/feed.xml"),
  },
});
