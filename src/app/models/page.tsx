import type { Metadata } from "next";
import { ModelTable } from "@/components/ModelTable";
import { DIMENSIONS, models } from "@/data/models";
import { SITE, absoluteUrl, alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "全部模型",
  description: `按权重、厂商与价格筛选 ${models.length} 款前沿大模型，查看综合智能、七维能力、上下文与速度。数据快照 ${SITE.dataDate}。`,
  alternates: alternatesFor("/models/"),
};

export default function ModelsPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <p className="eyebrow">Model Library · {models.length} models</p>
          <h1>一张表，装下前沿模型的全部关键指标</h1>
          <p>
            综合智能、API 价格、上下文、输出速度与七项能力基准。默认按智能指数排序，
            也可以按价格或速度重新看一遍——排序变了，结论可能就变了。
          </p>
          <div className="page-hero-meta">
            <span>快照 {SITE.dataDate}</span>
            <span>{DIMENSIONS.length} 个能力维度</span>
            <span>来源 {SITE.sourceName}</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="shell">
          <ModelTable />
        </div>
      </section>
    </>
  );
}