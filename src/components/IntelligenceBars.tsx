import Link from "next/link";
import { models, vendorColor, type Model } from "@/data/models";

export function IntelligenceBars({
  items = models,
}: {
  items?: Model[];
}) {
  return (
    <div className="bars">
      {items.map((model, index) => (
        <Link
          key={model.slug}
          className="bar-row"
          href={`/models/${model.slug}/`}
          aria-label={`${model.name}，综合智能 ${model.intelligence}`}
        >
          <span className="bar-rank">{String(index + 1).padStart(2, "0")}</span>
          <span className="bar-name">
            <span
              className="dot"
              style={{ background: vendorColor(model.vendor) }}
              aria-hidden="true"
            />
            <b>{model.name}</b>
            <span className="bar-vendor">{model.vendor}</span>
          </span>
          <span className="bar-track" aria-hidden="true">
            <span
              className="bar-fill"
              style={{
                width: `${model.intelligence}%`,
                background: vendorColor(model.vendor),
              }}
            />
          </span>
          <span className="bar-value">{model.intelligence.toFixed(1)}</span>
        </Link>
      ))}
    </div>
  );
}