# 模型视界 · Model Lens

前沿 AI 模型能力对比与选型站点：把 **16 款模型 × 7 个能力维度**、API 价格、上下文与速度放在同一套口径下，用可交互图表展示差异，并按任务、预算与上下文给出可解释的候选。

**在线站点：<https://sx-jannlee.github.io/ai-model-compare/>**

- 纯静态构建，无后端、无运行时 API 调用
- **v1.1 选型向导** `/match/`：四个偏好收敛到 3 个候选，偏好写入 URL
- **可分享对比** `/compare/?models=...`：复制链接即可还原同一组模型
- 更新日志 `/changelog/`，页脚显示当前版本
- Next.js App Router + React + TypeScript
- 图表为手写 SVG / DOM，不引入图表库
- 支持 SEO 的静态导出：独立 metadata、canonical、OG、JSON-LD、sitemap、robots、RSS

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 总览：智能排行、价格 × 能力散点、能力雷达、维度矩阵、最新动态 |
| `/models/` | 可筛选、可排序的完整模型表 |
| `/models/[slug]/` | 单模型详情：雷达、七维得分、价格与来源 |
| `/match/` | 选型向导：按任务、预算、上下文与开源偏好推荐前 3 款 |
| `/compare/` | 最多 3 款模型的雷达叠加与指标对比，选择可写入链接分享 |
| `/changelog/` | 版本更新日志与当前发布说明 |
| `/benchmarks/` | 评测口径、取数规则与局限 |
| `/news/` | 官方信源的前沿动态 |

## 技术栈

- Next.js `15.5`（`output: "export"` 静态导出）
- React `19.3`
- TypeScript `5.9`（strict）
- Vitest `5.1` + Testing Library 无关的 SSR 渲染断言
- CSS：单一设计系统，深色 editorial 风格，无 UI 框架

## 本地开发

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm test
npm run build        # 输出到 out/
npm run preview      # 本地预览 out/，http://localhost:4173
```

预览服务器会剥离 `NEXT_PUBLIC_BASE_PATH`，因此本地构建不需要设置该变量。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://sx-jannlee.github.io` | 站点域名，用于 canonical / OG / sitemap |
| `NEXT_PUBLIC_BASE_PATH` | 空 | GitHub Pages 子路径，如 `/ai-model-compare` |

部署到 GitHub Pages 时：

```bash
NEXT_PUBLIC_SITE_URL=https://sx-jannlee.github.io \
NEXT_PUBLIC_BASE_PATH=/ai-model-compare \
npm run build
```

## 数据

数据为**静态快照**，位于 `src/data/`：

- `models.ts`：16 款模型、7 个维度、价格、速度、单任务成本、官方链接
- `news.ts`：12 条官方信源动态

核心来源为 [Artificial Analysis](https://artificialanalysis.ai/) 的公开模型页与 Intelligence Index v5.0.2；新闻来自各厂商官方博客 / 新闻室。每款模型取 AA 收录的**最高推理档位**，因此比较的是能力上限。

更新数据时直接修改 `src/data/models.ts`，并同步更新 `CATALOG_DATE`。页面、sitemap、JSON-LD 与测试都会自动读取新快照。

> 分数是受控任务上的平均表现，不等同于你的业务效果。价格为首方 API 标价，不含缓存、批处理与长上下文溢价。本站与所列厂商无隶属关系。

## 目录结构

```
src/
  app/                # 路由、metadata、sitemap/robots/feed
  components/         # 图表、表格、导航、对比器、选型向导
  data/               # 模型、新闻与版本记录快照
  lib/                # 站点常量、对比 URL、选型评分
tests/                # 数据完整性与 SSR 渲染测试
scripts/              # 静态预览、截图与布局检查
docs/evidence/        # Before / After 视觉证据
.github/workflows/    # CI 与 GitHub Pages 部署
```

## 部署

推送到 `main` 后由 `.github/workflows/deploy.yml` 构建并发布到 GitHub Pages；也可以在 Actions 页面手动 `workflow_dispatch` 从任意分支发布预览。首次启用需在仓库 Settings → Pages 选择 **GitHub Actions** 作为 Source。

## 视觉证据

`docs/evidence/v11/` 保存 v1.1 同一场景、同一视口下的 Before / After 截图：

- `before-home-1440.png` / `before-home-1440-full.png`：v1.0 线上站点（d8c9739）
- `after-home-1440.png` / `after-home-1440-full.png`：v1.1 总览
- `before-home-390-full.png` / `after-home-390-full.png`：390px 移动端
- `after-match.png` / `after-match-mobile.png`：选型向导
- `after-compare-share.png`：带 `?models=` 的可分享对比
- `after-changelog.png`：更新日志

截图由 Playwright 生成；`scripts/audit.mjs` 会在 1440 / 1024 / 768 / 390 四种宽度下检查横向溢出、标题可见性、字体加载与控制台错误。