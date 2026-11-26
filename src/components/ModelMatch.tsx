"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { VendorDot } from "@/components/ui";
import { formatPrice, models, VENDOR_LABELS } from "@/data/models";
import {
  BUDGET_OPTIONS,
  CONTEXT_OPTIONS,
  DEFAULT_MATCH_PREFERENCES,
  TASK_OPTIONS,
  compareHref,
  dimensionForTask,
  formatContextLabel,
  parseMatchParams,
  preferencesEqual,
  recommend,
  serializeMatchParams,
  type BudgetKey,
  type ContextKey,
  type MatchPreferences,
  type MatchResult,
  type TaskKey,
} from "@/lib/match";
import styles from "@/app/match/match.module.css";

type CopyState = "idle" | "copied" | "failed";

const METRIC_LABELS: Record<string, string> = {
  cost: "单任务成本",
  context: "上下文",
  price: "输入 / 输出",
};

function Metric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.metric}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ResultCard({
  result,
  task,
  compareUrl,
  compareLabel,
}: {
  result: MatchResult;
  task: TaskKey;
  compareUrl: string;
  compareLabel: string;
}) {
  const { model } = result;
  const dimension = dimensionForTask(task);

  return (
    <li className={`${styles.card} ${result.rank === 1 ? styles.cardTop : ""}`}>
      <div className={styles.cardHead}>
        <span className={styles.rank} aria-hidden="true">
          {String(result.rank).padStart(2, "0")}
        </span>
        <span className="visually-hidden">第 {result.rank} 名</span>
        <div className={styles.cardTitle}>
          <h3 className={styles.title}>
            <VendorDot vendor={model.vendor} size={9} />
            <Link href={`/models/${model.slug}/`}>{model.name}</Link>
          </h3>
          <p className={styles.meta}>
            {VENDOR_LABELS[model.vendor] ?? model.vendor}
            <span aria-hidden="true"> · </span>
            {model.tagline}
          </p>
        </div>
        <div className={styles.match}>
          <span className={styles.matchValue}>{result.matchScore.toFixed(1)}</span>
          <span className={styles.matchLabel}>匹配分 / 100</span>
        </div>
      </div>

      <div className={styles.scoreTrack} aria-hidden="true">
        <span
          className={styles.scoreFill}
          style={{ width: `${Math.min(100, Math.max(0, result.matchScore))}%` }}
        />
      </div>

      <dl className={styles.metrics}>
        <Metric label="加权能力">{result.capability.toFixed(1)}</Metric>
        {dimension ? (
          <Metric label={`${dimension.label}得分`}>
            {result.taskScore.toFixed(1)}
          </Metric>
        ) : null}
        <Metric label={METRIC_LABELS.price}>{formatPrice(model)}</Metric>
        <Metric label={METRIC_LABELS.cost}>
          ${model.costPerTask.toFixed(2)}
        </Metric>
        <Metric label={METRIC_LABELS.context}>
          {formatContextLabel(model.contextK)}
        </Metric>
      </dl>

      <ul className={styles.reasons}>
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>

      <div className={styles.cardActions}>
        <Link className="btn btn-ghost btn-small" href={`/models/${model.slug}/`}>
          模型详情 <span aria-hidden="true">→</span>
        </Link>
        <Link className="btn btn-ghost btn-small" href={compareUrl}>
          {compareLabel}
        </Link>
      </div>
    </li>
  );
}

export function ModelMatch() {
  const [preferences, setPreferences] = useState<MatchPreferences>(
    DEFAULT_MATCH_PREFERENCES,
  );
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimer = useRef<number | null>(null);

  // Server-render the balanced defaults, then adopt validated URL state.
  useEffect(() => {
    const parsed = parseMatchParams(window.location.search);
    setPreferences((current) =>
      preferencesEqual(current, parsed) ? current : parsed,
    );
    setHydrated(true);
  }, []);

  // Keep the address bar shareable without adding history entries or navigating.
  useEffect(() => {
    if (!hydrated) return;
    const query = serializeMatchParams(preferences);
    const nextSearch = query ? `?${query}` : "";
    if (window.location.search === nextSearch) return;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${nextSearch}${window.location.hash}`,
    );
  }, [hydrated, preferences]);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const outcome = useMemo(() => recommend(preferences), [preferences]);
  const { candidates, results, costWeight } = outcome;

  const update = <Key extends keyof MatchPreferences>(
    key: Key,
    value: MatchPreferences[Key],
  ) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setPreferences(DEFAULT_MATCH_PREFERENCES);
    setCopyState("idle");
  };

  const copyLink = async () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    copyTimer.current = window.setTimeout(() => setCopyState("idle"), 2600);
  };

  const activeTask = TASK_OPTIONS.find(
    (option) => option.value === preferences.task,
  );
  const activeBudget = BUDGET_OPTIONS.find(
    (option) => option.value === preferences.budget,
  );
  const activeContext = CONTEXT_OPTIONS.find(
    (option) => option.value === preferences.context,
  );
  const compareLabel =
    results.length > 1 ? `对比这 ${results.length} 款` : "打开对比";
  const topCompareUrl = compareHref(results.map((result) => result.model.slug));
  const defaults = preferencesEqual(preferences, DEFAULT_MATCH_PREFERENCES);

  return (
    <div className={styles.layout}>
      <aside className={styles.controlPanel} aria-labelledby="match-controls-heading">
        <div className={styles.controlHead}>
          <div>
            <p className={styles.kicker}>Preferences</p>
            <h2 className={styles.controlTitle} id="match-controls-heading">
              你的偏好
            </h2>
          </div>
          <button
            type="button"
            className={`chip ${styles.reset}`}
            onClick={reset}
            disabled={defaults}
          >
            恢复默认
          </button>
        </div>

        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
          <fieldset className={styles.group} aria-describedby="match-task-hint">
            <legend className={styles.legend}>主要任务</legend>
            <p className={styles.hint} id="match-task-hint">
              任务维度占能力分 60%，综合智能占 40%。
            </p>
            <div className={styles.options}>
              {TASK_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={styles.option}
                  data-active={preferences.task === option.value}
                  title={option.hint}
                >
                  <input
                    type="radio"
                    name="match-task"
                    value={option.value}
                    checked={preferences.task === option.value}
                    onChange={() => update("task", option.value as TaskKey)}
                  />
                  <span className={styles.optionLabel}>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group} aria-describedby="match-budget-hint">
            <legend className={styles.legend}>预算偏好</legend>
            <p className={styles.hint} id="match-budget-hint">
              成本权重越高，越偏向单位任务成本低的模型。
            </p>
            <div className={`${styles.options} ${styles.stack}`}>
              {BUDGET_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={styles.option}
                  data-active={preferences.budget === option.value}
                >
                  <input
                    type="radio"
                    name="match-budget"
                    value={option.value}
                    checked={preferences.budget === option.value}
                    onChange={() => update("budget", option.value as BudgetKey)}
                  />
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionHint}>{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group} aria-describedby="match-context-hint">
            <legend className={styles.legend}>上下文需求</legend>
            <p className={styles.hint} id="match-context-hint">
              按最大上下文窗口筛选，不衡量长文中的有效利用率。
            </p>
            <div className={`${styles.options} ${styles.stack}`}>
              {CONTEXT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={styles.option}
                  data-active={preferences.context === option.value}
                >
                  <input
                    type="radio"
                    name="match-context"
                    value={option.value}
                    checked={preferences.context === option.value}
                    onChange={() => update("context", option.value as ContextKey)}
                  />
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionHint}>{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>模型权重</legend>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={preferences.openOnly}
                onChange={(event) => update("openOnly", event.target.checked)}
              />
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>只看开源权重</span>
                <span className={styles.optionHint}>可自部署、可微调</span>
              </span>
            </label>
          </fieldset>
        </form>

        <div className={styles.share}>
          <p className={styles.shareText}>
            偏好会写入地址栏，复制链接即可分享同一组推荐。
          </p>
          <button type="button" className={`chip ${styles.copy}`} onClick={copyLink}>
            {copyState === "copied"
              ? "已复制链接"
              : copyState === "failed"
                ? "复制失败，请复制地址栏"
                : "复制分享链接"}
          </button>
          <p className={styles.shareStatus} aria-live="polite">
            {copyState === "copied"
              ? "分享链接已复制到剪贴板。"
              : copyState === "failed"
                ? "复制失败，请手动复制浏览器地址栏。"
                : ""}
          </p>
        </div>
      </aside>

      <section className={styles.board} aria-labelledby="match-results-heading">
        <div className={styles.boardHead}>
          <div>
            <p className={styles.kicker}>Top matches</p>
            <h2 className={styles.boardTitle} id="match-results-heading">
              推荐结果
            </h2>
            <div className={styles.activeSummary} aria-label="当前偏好">
              <span className={styles.activeChip}>任务 · {activeTask?.label}</span>
              <span className={styles.activeChip}>预算 · {activeBudget?.label}</span>
              <span className={styles.activeChip}>
                成本权重 · {Math.round(costWeight * 100)}%
              </span>
              <span className={styles.activeChip}>
                上下文 · {activeContext?.label}
              </span>
              {preferences.openOnly ? (
                <span className={styles.activeChip}>仅开源</span>
              ) : null}
            </div>
          </div>
          {results.length > 1 ? (
            <Link className="btn btn-primary btn-small" href={topCompareUrl}>
              并排对比 Top {results.length} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>

        <p className={styles.boardMeta} aria-live="polite">
          候选池 {candidates.length} / {models.length} 款通过筛选 ·{" "}
          {results.length === 0
            ? "暂无推荐"
            : results.length < 3
              ? `通过筛选的 ${results.length} 款已全部展示`
              : `按匹配分展示前 ${results.length} 名`}
        </p>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <p>没有模型同时满足当前筛选条件。</p>
            <p>试试把上下文需求放宽到「不限」，或关闭「只看开源权重」。</p>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() =>
                setPreferences((current) => ({
                  ...current,
                  context: "any",
                  openOnly: false,
                }))
              }
            >
              放宽筛选条件
            </button>
          </div>
        ) : (
          <ol className={styles.results}>
            {results.map((result) => (
              <ResultCard
                key={result.model.slug}
                result={result}
                task={preferences.task}
                compareUrl={topCompareUrl}
                compareLabel={compareLabel}
              />
            ))}
          </ol>
        )}

        <p className={styles.footnote}>
          匹配分是决策辅助，不替代针对你自身数据的评测。上下文为最大窗口，
          实际有效长度与任务形态有关。
        </p>
      </section>
    </div>
  );
}