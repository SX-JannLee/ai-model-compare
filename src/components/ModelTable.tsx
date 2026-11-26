"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DIMENSIONS,
  formatContext,
  formatPrice,
  models,
  VENDOR_LABELS,
  vendorColor,
} from "@/data/models";

type SortKey = "intelligence" | "priceOutput" | "speed" | "costPerTask" | "releaseDate";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "intelligence", label: "综合智能" },
  { value: "priceOutput", label: "输出价格" },
  { value: "speed", label: "输出速度" },
  { value: "costPerTask", label: "单任务成本" },
  { value: "releaseDate", label: "发布日期" },
];

const vendors = Array.from(new Set(models.map((model) => model.vendor)));

export function ModelTable() {
  const [vendor, setVendor] = useState<string>("all");
  const [license, setLicense] = useState<"all" | "open" | "closed">("all");
  const [sort, setSort] = useState<SortKey>("intelligence");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const visible = useMemo(() => {
    const filtered = models.filter((model) => {
      if (vendor !== "all" && model.vendor !== vendor) return false;
      if (license === "open" && !model.openWeights) return false;
      if (license === "closed" && model.openWeights) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      const result =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : Number(av) - Number(bv);
      return direction === "asc" ? result : -result;
    });
  }, [vendor, license, sort, direction]);

  const reset = () => {
    setVendor("all");
    setLicense("all");
    setSort("intelligence");
    setDirection("desc");
  };

  return (
    <>
      <div className="model-toolbar">
        <span className="filter-label">权重</span>
        <button
          type="button"
          className="chip"
          aria-pressed={license === "all"}
          onClick={() => setLicense("all")}
        >
          全部
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={license === "open"}
          onClick={() => setLicense("open")}
        >
          开源
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={license === "closed"}
          onClick={() => setLicense("closed")}
        >
          闭源
        </button>

        <span className="filter-label" style={{ marginLeft: 8 }}>
          厂商
        </span>
        <select
          className="select"
          value={vendor}
          onChange={(event) => setVendor(event.target.value)}
          aria-label="按厂商筛选"
        >
          <option value="all">全部厂商</option>
          {vendors.map((item) => (
            <option value={item} key={item}>
              {VENDOR_LABELS[item] ?? item}
            </option>
          ))}
        </select>

        <span className="filter-label" style={{ marginLeft: 8 }}>
          排序
        </span>
        <select
          className="select"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          aria-label="排序字段"
        >
          {sortOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="chip"
          onClick={() => setDirection((value) => (value === "asc" ? "desc" : "asc"))}
          aria-label={`当前${direction === "desc" ? "降序" : "升序"}，点击切换`}
        >
          {direction === "desc" ? "降序 ↓" : "升序 ↑"}
        </button>

        <span className="toolbar-right">
          {visible.length} / {models.length} 款
          <button
            type="button"
            className="chip"
            style={{ marginLeft: 10 }}
            onClick={reset}
          >
            重置
          </button>
        </span>
      </div>

      <div className="model-table-wrap">
        <table className="model-table">
          <caption className="visually-hidden">
            前沿 AI 模型对比表，可按权重、厂商筛选并按列排序
          </caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">模型</th>
              <th scope="col" className="num">
                综合智能
              </th>
              <th scope="col" className="num">
                价格 / 1M
              </th>
              <th scope="col" className="num">
                上下文
              </th>
              <th scope="col" className="num">
                速度
              </th>
              <th scope="col" className="num">
                单任务成本
              </th>
              <th scope="col">权重</th>
              <th scope="col">发布</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((model) => {
              const rank = models.findIndex((item) => item.slug === model.slug) + 1;
              return (
                <tr key={model.slug}>
                  <td>
                    <span className="rank-num">{String(rank).padStart(2, "0")}</span>
                  </td>
                  <td>
                    <Link className="model-link" href={`/models/${model.slug}/`}>
                      <span
                        className="dot"
                        style={{ background: vendorColor(model.vendor) }}
                        aria-hidden="true"
                      />
                      <span>
                        {model.name}
                        <small>{VENDOR_LABELS[model.vendor] ?? model.vendor}</small>
                      </span>
                    </Link>
                  </td>
                  <td className="num">
                    <span className="score-cell">
                      <span className="mini-bar" aria-hidden="true">
                        <span
                          style={{
                            width: `${model.intelligence}%`,
                            background: vendorColor(model.vendor),
                          }}
                        />
                      </span>
                      {model.intelligence.toFixed(1)}
                    </span>
                  </td>
                  <td className="num">{formatPrice(model)}</td>
                  <td className="num">{formatContext(model.contextK)}</td>
                  <td className="num">{model.speed} tok/s</td>
                  <td className="num">${model.costPerTask.toFixed(2)}</td>
                  <td>
                    {model.openWeights ? (
                      <span className="tag tag-open">开源</span>
                    ) : (
                      <span className="tag">闭源</span>
                    )}
                  </td>
                  <td className="num" style={{ color: "var(--faint)" }}>
                    {model.releaseDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <p className="table-empty">
            当前筛选条件下没有模型。试试「重置」或切换厂商。
          </p>
        ) : null}
      </div>

      <p className="note">
        价格单位为美元 / 百万 tokens（输入 / 输出）；单任务成本来自{" "}
        {DIMENSIONS.length} 项评测的平均消耗，不等同于你的实际账单。
      </p>
    </>
  );
}