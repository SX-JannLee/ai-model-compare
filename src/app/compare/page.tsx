import type { Metadata } from "next";
import { CompareExplorer } from "@/components/CompareExplorer";
import { models } from "@/data/models";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "模型对比",
  description: `自由选择最多 3 款前沿模型，叠加七维能力雷达并横向比较智能、价格、上下文与速度。覆盖 ${models.length} 款模型，数据快照 ${SITE.dataDate}。`,
  alternates: alternatesFor("/compare/"),
};

export default function ComparePage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <p className="eyebrow">Side by side · Max 3</p>
          <h1>把模型放在同一张图上</h1>
          <p>
            选 1–3 款模型，叠加雷达、对齐价格与速度。差异会立刻显现：
            有的模型面积更大，有的只在某几根轴上突出。
          </p>
          <div className="page-hero-meta">
            <span>{models.length} 款可选</span>
            <span>七维原始通过率</span>
            <span>价格来自官方 API 标价</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="shell">
          <CompareExplorer />
        </div>
      </section>
    </>
  );
}