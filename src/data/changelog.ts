export interface Release {
  version: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  fixes?: string[];
  links?: { label: string; href: string }[];
}

/** Anchor id used by /changelog/ — e.g. 1.1.0 → v1-1-0. */
export const releaseAnchor = (version: string): string =>
  `v${version.replace(/\./g, "-")}`;

export const releases: Release[] = [
  {
    version: "1.1.0",
    date: "2026-11-26",
    title: "从看榜到选型：让比较可分享",
    summary:
      "v1.1 把「看榜单」推进到「做选择」：新增引导式选型向导，对比页的选择可以写进链接分享给别人，并补上更新日志与可见版本号。数据快照仍为 2026-11-26，是构建时写入的静态快照，不是实时数据源。",
    highlights: [
      "新增 /match/ 引导式选型向导：按任务、预算、上下文与开源权重四个问题，给出最匹配的前 3 款模型。",
      "对比页支持可分享链接：当前选择会写入 /compare/?models=...，并提供复制链接与重置操作，打开链接即可还原同一组对比。",
      "新增 /changelog/ 更新日志页，页面上可以看见当前站点版本与发布日期，之后每次发布都能回溯。",
      "v1.1 把可访问性、响应式与 SEO 列为发布验收重点：390px 移动端布局、键盘焦点与结构化数据。",
      "数据快照仍为 2026-11-26。本站是静态快照，不会自动跟踪厂商更新；要反映新模型，需要重新构建。",
    ],
    links: [
      { label: "选型向导", href: "/match/" },
      { label: "模型对比", href: "/compare/" },
      { label: "模型库", href: "/models/" },
      { label: "评测方法", href: "/benchmarks/" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-11-26",
    title: "首发：16 款模型 × 7 个维度的静态对比站",
    summary:
      "模型视界 v1.0 上线：用同一套口径汇总前沿模型的能力、价格与速度，全部页面在构建时静态导出，不依赖后端或实时 API。",
    highlights: [
      "收录 16 款前沿模型，覆盖 7 个能力维度，并记录 API 价格、输出速度与单任务成本。",
      "提供六类页面：首页、模型库、模型详情、模型对比、评测方法与最新动态。",
      "图表全部由手写 SVG 与 DOM 绘制，不引入第三方图表库。",
      "完成静态 SEO 导出：sitemap、RSS、结构化数据，并通过 GitHub Pages 部署。",
    ],
    links: [
      { label: "模型库", href: "/models/" },
      { label: "评测方法", href: "/benchmarks/" },
    ],
  },
];