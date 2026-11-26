"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import {
  DIMENSIONS,
  formatContext,
  getModel,
  models,
  type Model,
  vendorColor,
} from "@/data/models";
import {
  DEFAULT_COMPARE_SLUGS,
  buildCompareUrl,
  buildDefaultCompareUrl,
  parseCompareSlugs,
  toggleCompareSlug,
} from "@/lib/compare";

const PALETTE = ["#D8FF3E", "#FF7A59", "#7AA2FF"];

const COPY_SUCCESS = "链接已复制";
const COPY_FAILURE = "复制失败，请手动复制地址栏链接";

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

const sameSelection = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((slug, index) => slug === b[index]);

/** Build an absolute, shareable URL for the current path and selection. */
function compareUrlWith(slugs: readonly string[]): string | null {
  try {
    return buildCompareUrl(window.location.href, slugs);
  } catch {
    return null;
  }
}

/** Build the current page URL with the selection parameter removed. */
function compareUrlWithout(): string | null {
  try {
    return buildDefaultCompareUrl(window.location.href);
  } catch {
    return null;
  }
}

/** Replace the address bar without navigating or reloading. */
function replaceHistory(target: string | null): void {
  if (!target) return;
  try {
    window.history.replaceState(window.history.state, "", target);
  } catch {
    // Sandboxed frames may block history updates; the selection still works.
  }
}

/** Copy without the async Clipboard API, e.g. on older browsers or http. */
function copyWithTextarea(text: string): boolean {
  if (typeof document === "undefined" || !document.body) return false;

  const previousFocus = document.activeElement as HTMLElement | null;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.tabIndex = -1;
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.padding = "0";
  textarea.style.border = "none";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  try {
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return typeof document.execCommand === "function"
      ? document.execCommand("copy")
      : false;
  } catch {
    return false;
  } finally {
    try {
      textarea.parentNode?.removeChild(textarea);
      previousFocus?.focus?.();
    } catch {
      // Cleanup is best-effort; never mask the copy result with an error.
    }
  }
}

export function CompareExplorer() {
  const [selected, setSelected] = useState<string[]>([
    ...DEFAULT_COMPARE_SLUGS,
  ]);
  const selectedRef = useRef<string[]>(selected);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Static export: read the query string after hydration rather than with
  // useSearchParams, so the default trio can be server-rendered unchanged.
  useEffect(() => {
    const parsed = parseCompareSlugs(window.location.search);
    if (sameSelection(selectedRef.current, parsed)) return;
    selectedRef.current = parsed;
    setSelected(parsed);
  }, []);

  useEffect(
    () => () => {
      if (statusTimer.current !== null) clearTimeout(statusTimer.current);
    },
    [],
  );

  const chosen = useMemo(
    () => selected.map((slug) => getModel(slug)).filter(Boolean) as Model[],
    [selected],
  );

  const applySelection = (next: string[]) => {
    // Keep the ref ahead of React so copy/other handlers never read stale state.
    selectedRef.current = next;
    setSelected(next);
  };

  const announceCopy = (message: string) => {
    if (statusTimer.current !== null) clearTimeout(statusTimer.current);
    // Clear first so assistive technology re-announces identical messages.
    setCopyStatus("");
    statusTimer.current = setTimeout(() => {
      statusTimer.current = null;
      setCopyStatus(message);
    }, 30);
  };

  const syncSelection = (next: string[]) => {
    replaceHistory(compareUrlWith(next));
  };

  const toggle = (slug: string) => {
    const current = selectedRef.current;
    const next = toggleCompareSlug(current, slug);
    if (sameSelection(current, next)) return;

    applySelection(next);
    syncSelection(next);
  };

  const resetSelection = () => {
    applySelection([...DEFAULT_COMPARE_SLUGS]);
    replaceHistory(compareUrlWithout());
    if (statusTimer.current !== null) {
      clearTimeout(statusTimer.current);
      statusTimer.current = null;
    }
    setCopyStatus("");
  };

  const copyCompareLink = async () => {
    // Build from the latest committed selection, not a pending URL update.
    const target = compareUrlWith(selectedRef.current);
    if (!target) {
      announceCopy(COPY_FAILURE);
      return;
    }

    let copied = false;

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.clipboard?.writeText === "function"
      ) {
        await navigator.clipboard.writeText(target);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      try {
        copied = copyWithTextarea(target);
      } catch {
        copied = false;
      }
    }

    announceCopy(copied ? COPY_SUCCESS : COPY_FAILURE);
  };

  return (
    <>
      <div
        role="group"
        aria-label="分享与重置对比"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 12px",
          marginTop: 24,
        }}
      >
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => void copyCompareLink()}
          aria-describedby="compare-share-note"
        >
          复制对比链接
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={resetSelection}
        >
          重置选择
        </button>
        <p
          id="compare-share-note"
          className="compare-hint"
          style={{ flex: "1 1 240px", minWidth: 0 }}
        >
          链接会保留当前选择，分享后打开即恢复同一组模型。
        </p>
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="compare-hint"
        style={{
          minHeight: "1.6em",
          marginTop: 4,
          color:
            copyStatus === COPY_SUCCESS
              ? "var(--lime)"
              : copyStatus === COPY_FAILURE
                ? "var(--coral)"
                : "var(--faint)",
        }}
      >
        {copyStatus}
      </p>

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