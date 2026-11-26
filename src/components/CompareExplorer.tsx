"use client";

import { useMemo, useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import {
  DIMENSIONS,
  formatContext,
  getModel,
  models,
  type Model,
  vendorColor,
} from "@/data/models";

const PALETTE = ["#D8FF3E", "#FF7A59", "#7AA2FF"];
const DEFAULT = ["claude-fable-5-2", "gpt-6-2-sol", "kimi-k3-1-pro"];

interface Metric {
  label: string;
  better: "max" | "min";
  value: (model: Model) => number;
  display: (model: Model) => string;
}

const metrics: Metric[] = [
  {
    label: "综合智能",
    better: "max",
    value: (model) => model.intelligence,
    display: (model) => model.intelligence.toFixed(1),
  },
  {
    label: "输入价格",
    better: "min",
    value: (model) => model.priceInput,
    display: (model) => `$${model.priceInput}`,
  },
  {
    label: "输出价格",
    better: "min",
    value: (model) => model.priceOutput,
    display: (model) => `$${model.priceOutput}`,
  },
  {
    label: "单任务成本",
    better: "min",
    value: (model) => model.costPerTask,
    display: (model) => `$${model.costPerTask.toFixed(2)}`,
  },
  {
    label: "上下文",
    better: "max",
    value: (model) => model.contextK,
    display: (model) => formatContext(model.contextK),
  },
  {
    label: "输出速度",
    better: "max",
    value: (model) => model.speed,
    display: (model) => `${model.speed}`,
  },
  ...DIMENSIONS.map<Metric>((dimension) => ({
    label: dimension.label,
    better: "max",
    value: (model) => model.scores[dimension.key],
    display: (model) => model.scores[dimension.key].toFixed(1),
  })),
];


export function CompareExplorer() {
  const [selected, setSelected] = useState<string[]>(DEFAULT);

  const chosen = useMemo(
    () => selected.map((slug) => getModel(slug)).filter(Boolean) as Model[],
    [selected],
  );

  const toggle = (slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== slug);
      }
      if (current.length >= 3) {
        return [...current.slice(1), slug];
      }
      return [...current, slug];
    });
  };

  return (
    <>
      <div className="compare-chips" role="group" aria-label="选择要对比的模型">
        {models.map((model) => {
          const active = selected.includes(model.slug);
          const index = selected.indexOf(model.slug);
          return (
            <button
              key={model.slug}
              type="button"
              className="chip"
              aria-pressed={active}
              onClick={() => toggle(model.slug)}
              title={
                active
                  ? `已选择，点击移除 ${model.name}`
                  : `加入对比 ${model.name}`
              }
            >
              {active ? (
                <span
                  className="dot"
                  style={{
                    background: PALETTE[index] ?? "var(--lime)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,.25)",
                  }}
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="dot"
                  style={{ background: vendorColor(model.vendor) }}
                  aria-hidden="true"
                />
              )}
              {model.name}
            </button>
          );
        })}
      </div>

      <div className="compare-layout">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">能力雷达叠加</span>
            <span className="panel-sub">{chosen.length} / 3 selected</span>
          </div>
          <div className="panel-body">
            <RadarChart
              series={chosen.map((model, index) => ({
                model,
                color: PALETTE[index] ?? "#d8ff3e",
              }))}
              size={480}
            />
            <div className="radar-legend" style={{ marginTop: 18 }}>
              {chosen.map((model, index) => (
                <div className="radar-key" key={model.slug}>
                  <span
                    className="dot"
                    style={{
                      background: PALETTE[index] ?? "#d8ff3e",
                    }}
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
                每根轴都是独立的 0–100 通过率，不能跨轴相加。先看你的任务对应哪根轴，
                再看谁的面更外扩。
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">指标对比</span>
            <span className="panel-sub">Lower price · Higher score</span>
          </div>
          <div className="panel-body" style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <caption className="visually-hidden">
                {chosen.map((model) => model.name).join("、")} 的关键指标对比
              </caption>
              <thead>
                <tr>
                  <th scope="col">指标</th>
                  {chosen.map((model) => (
                    <th scope="col" key={model.slug}>
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => {
                  const values = chosen.map((model) => metric.value(model));
                  const best =
                    metric.better === "max"
                      ? Math.max(...values)
                      : Math.min(...values);
                  return (
                    <tr key={metric.label}>
                      <th scope="row">{metric.label}</th>
                      {chosen.map((model) => {
                        const isBest = metric.value(model) === best;
                        return (
                          <td
                            key={model.slug}
                            className={isBest ? "best" : undefined}
                          >
                            {metric.display(model)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="note">
              高亮为该行最优值。价格为官方标价，未计入缓存与批处理折扣；
              上下文为最大窗口，不等同于有效可用长度。
            </p>
          </div>
        </div>
      </div>

      <div className="callout" style={{ marginTop: 24 }}>
        <span className="callout-mark">i</span>
        <p>
          选择逻辑：最多同时对比 3 款。第 4 款会替换最早选择的一款。
          当前组合包含 {chosen.length} 款模型，雷达颜色与上方图例一一对应。
        </p>
      </div>
    </>
  );
}