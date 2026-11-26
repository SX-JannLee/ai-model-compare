import Link from "next/link";
import {
  DIMENSIONS,
  models,
  vendorColor,
  type Model,
} from "@/data/models";

const heat = (value: number): string =>
  `rgba(216, 255, 62, ${(0.03 + (value / 100) * 0.34).toFixed(3)})`;

export function DimensionMatrix({ items = models }: { items?: Model[] }) {
  return (
    <div className="matrix-wrap">
      <table className="matrix">
        <caption className="visually-hidden">
          各模型在七个能力维度上的得分矩阵，数值为通过率百分比
        </caption>
        <thead>
          <tr>
            <th scope="col">模型</th>
            <th scope="col">综合</th>
            {DIMENSIONS.map((dimension) => (
              <th key={dimension.key} scope="col" title={dimension.benchmark}>
                {dimension.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((model, index) => (
            <tr key={model.slug}>
              <th scope="row">
                <Link className="model-cell" href={`/models/${model.slug}/`}>
                  <span
                    className="dot"
                    style={{ background: vendorColor(model.vendor) }}
                    aria-hidden="true"
                  />
                  <b>{model.name}</b>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                </Link>
              </th>
              <td className="heat-cell" style={{ background: heat(model.intelligence) }}>
                {model.intelligence.toFixed(1)}
              </td>
              {DIMENSIONS.map((dimension) => {
                const value = model.scores[dimension.key];
                return (
                  <td
                    key={dimension.key}
                    className="heat-cell"
                    style={{ background: heat(value) }}
                    title={`${dimension.benchmark}：${value}%`}
                  >
                    {value.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="matrix-legend">
        <span>
          数值为通过率 / 得分百分比；颜色越亮，能力越强。点击模型名查看详情。
        </span>
        <span className="heat-scale">
          低 <span className="heat-swatch" aria-hidden="true" /> 高
        </span>
      </div>
    </div>
  );
}
