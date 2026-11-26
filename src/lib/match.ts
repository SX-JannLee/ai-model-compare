import {
  DIMENSIONS,
  formatContext,
  models,
  type DimensionKey,
  type Model,
} from "@/data/models";

/** "balanced" asks for the overall intelligence index, everything else is a dimension. */
export type TaskKey = "balanced" | DimensionKey;

export type BudgetKey = "quality" | "balanced" | "value";

export type ContextKey = "any" | "long200" | "long1m";

export interface MatchPreferences {
  task: TaskKey;
  budget: BudgetKey;
  context: ContextKey;
  openOnly: boolean;
}

export const DEFAULT_MATCH_PREFERENCES: MatchPreferences = {
  task: "balanced",
  budget: "balanced",
  context: "any",
  openOnly: false,
};

/** Cost weight applied to the value score. Lower = spend for capability. */
export const BUDGET_COST_WEIGHTS: Record<BudgetKey, number> = {
  quality: 0.1,
  balanced: 0.25,
  value: 0.45,
};

/** Minimum context window (in thousands of tokens) accepted by each option. */
export const CONTEXT_MIN_K: Record<ContextKey, number> = {
  any: 0,
  long200: 200,
  long1m: 1000,
};

export interface TaskOption {
  value: TaskKey;
  label: string;
  hint: string;
}

export const TASK_OPTIONS: TaskOption[] = [
  { value: "balanced", label: "综合均衡", hint: "综合智能" },
  ...DIMENSIONS.map<TaskOption>((dimension) => ({
    value: dimension.key,
    label: dimension.label,
    hint: dimension.benchmark,
  })),
];

export interface BudgetOption {
  value: BudgetKey;
  label: string;
  hint: string;
}

export const BUDGET_OPTIONS: BudgetOption[] = [
  { value: "quality", label: "能力优先", hint: "成本权重 10%" },
  { value: "balanced", label: "均衡", hint: "成本权重 25%" },
  { value: "value", label: "性价比优先", hint: "成本权重 45%" },
];

export interface ContextOption {
  value: ContextKey;
  label: string;
  hint: string;
}

export const CONTEXT_OPTIONS: ContextOption[] = [
  { value: "any", label: "不限", hint: "全部窗口" },
  { value: "long200", label: "≥ 200K", hint: "长文档" },
  { value: "long1m", label: "≥ 1M", hint: "超长上下文" },
];

const isTaskKey = (value: string | null): value is TaskKey =>
  value === "balanced" ||
  DIMENSIONS.some((dimension) => dimension.key === value);

const isBudgetKey = (value: string | null): value is BudgetKey =>
  value === "quality" || value === "balanced" || value === "value";

const isContextKey = (value: string | null): value is ContextKey =>
  value === "any" || value === "long200" || value === "long1m";

export const costWeightFor = (budget: BudgetKey): number =>
  BUDGET_COST_WEIGHTS[budget];

export const preferencesEqual = (
  a: MatchPreferences,
  b: MatchPreferences,
): boolean =>
  a.task === b.task &&
  a.budget === b.budget &&
  a.context === b.context &&
  a.openOnly === b.openOnly;

export const dimensionForTask = (task: TaskKey) =>
  task === "balanced"
    ? undefined
    : DIMENSIONS.find((dimension) => dimension.key === task);

/**
 * Capability is the intelligence index for "balanced", otherwise a 60/40 blend
 * of the chosen task dimension and overall intelligence.
 */
export const capabilityFor = (model: Model, task: TaskKey): number => {
  if (task === "balanced") return model.intelligence;
  return 0.6 * model.scores[task] + 0.4 * model.intelligence;
};

export const buildValueScores = (catalog: readonly Model[]): Map<string, number> => {
  const costs = catalog.map((model) => model.costPerTask);
  const cheapest = Math.min(...costs);
  const priciest = Math.max(...costs);
  const denominator = Math.log(priciest) - Math.log(cheapest);
  const scores = new Map<string, number>();

  for (const model of catalog) {
    if (denominator <= 0) {
      scores.set(model.slug, 100);
      continue;
    }
    const normalized =
      ((Math.log(priciest) - Math.log(Math.max(model.costPerTask, cheapest))) /
        denominator) *
      100;
    scores.set(model.slug, Math.min(100, Math.max(0, normalized)));
  }

  return scores;
};

export const filterCandidates = (
  preferences: MatchPreferences,
  catalog: readonly Model[] = models,
): Model[] => {
  const minimumContext = CONTEXT_MIN_K[preferences.context];
  return catalog.filter((model) => {
    if (preferences.openOnly && !model.openWeights) return false;
    if (model.contextK < minimumContext) return false;
    return true;
  });
};

export interface MatchResult {
  rank: number;
  model: Model;
  /** Blended capability used by the match score, 0–100. */
  capability: number;
  /** The raw task-dimension score, or intelligence for "balanced". */
  taskScore: number;
  /** Inverse log-normalized cost per task, 0–100. */
  value: number;
  /** Rounded final match score, 0–100. */
  matchScore: number;
  reasons: string[];
}

export interface MatchOutcome {
  preferences: MatchPreferences;
  costWeight: number;
  candidates: Model[];
  results: MatchResult[];
}

export const formatContextLabel = (contextK: number): string =>
  contextK >= 1000 ? formatContext(contextK) : `${contextK}K`;

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const strongestDimension = (model: Model) =>
  [...DIMENSIONS].sort(
    (a, b) => model.scores[b.key] - model.scores[a.key],
  )[0];

const buildReasons = (
  model: Model,
  preferences: MatchPreferences,
  capability: number,
  value: number,
  candidates: readonly Model[],
): string[] => {
  const reasons: string[] = [];
  const task = dimensionForTask(preferences.task);
  const costs = candidates.map((candidate) => candidate.costPerTask);
  const cheapest = Math.min(...costs);
  const middle = median(costs);

  if (task) {
    const ranked = [...candidates].sort(
      (a, b) => b.scores[task.key] - a.scores[task.key],
    );
    const rank = ranked.findIndex((candidate) => candidate.slug === model.slug) + 1;
    reasons.push(
      `${task.label} ${model.scores[task.key].toFixed(1)} 分，候选池第 ${rank}；加权能力 ${capability.toFixed(1)}。`,
    );
  } else {
    const ranked = [...candidates].sort(
      (a, b) => b.intelligence - a.intelligence,
    );
    const rank = ranked.findIndex((candidate) => candidate.slug === model.slug) + 1;
    reasons.push(
      `综合智能 ${model.intelligence.toFixed(1)}，候选池第 ${rank}。`,
    );
  }

  if (Math.abs(model.costPerTask - cheapest) < 1e-9) {
    reasons.push(
      `单任务成本 $${model.costPerTask.toFixed(2)}，是候选池中最低的一档。`,
    );
  } else if (model.costPerTask <= middle) {
    reasons.push(
      `单任务成本 $${model.costPerTask.toFixed(2)}，低于候选池中位数 $${middle.toFixed(2)}。`,
    );
  } else {
    reasons.push(
      `单任务成本 $${model.costPerTask.toFixed(2)}，性价比得分 ${value.toFixed(0)}/100。`,
    );
  }

  if (model.openWeights) {
    reasons.push("开源权重，可自部署或按需微调。");
  } else if (preferences.context === "long1m") {
    reasons.push(
      `${formatContextLabel(model.contextK)} 上下文，满足 1M 长文需求。`,
    );
  } else if (preferences.context === "long200") {
    reasons.push(
      `${formatContextLabel(model.contextK)} 上下文，满足 200K 长文需求。`,
    );
  } else if (model.contextK >= 1000) {
    reasons.push(
      `${formatContextLabel(model.contextK)} 上下文，适合长文档与大型代码库。`,
    );
  } else {
    const strongest = strongestDimension(model);
    reasons.push(
      `最强项是${strongest.label}（${model.scores[strongest.key].toFixed(1)} 分）。`,
    );
  }

  return reasons.slice(0, 3);
};

export const recommend = (
  preferences: MatchPreferences,
  catalog: readonly Model[] = models,
  limit = 3,
): MatchOutcome => {
  const candidates = filterCandidates(preferences, catalog);
  const valueScores = buildValueScores(catalog);
  const costWeight = costWeightFor(preferences.budget);

  const scored = candidates.map((model) => {
    const capability = capabilityFor(model, preferences.task);
    const value = valueScores.get(model.slug) ?? 0;
    const matchScore =
      Math.round(((1 - costWeight) * capability + costWeight * value) * 10) / 10;
    return { model, capability, taskScore: capability, value, matchScore };
  });

  scored.sort(
    (a, b) =>
      b.matchScore - a.matchScore ||
      b.model.intelligence - a.model.intelligence ||
      a.model.costPerTask - b.model.costPerTask ||
      a.model.slug.localeCompare(b.model.slug),
  );

  const results: MatchResult[] = scored.slice(0, Math.max(0, limit)).map(
    (entry, index) => ({
      ...entry,
      taskScore:
        preferences.task === "balanced"
          ? entry.model.intelligence
          : entry.model.scores[preferences.task],
      rank: index + 1,
      reasons: buildReasons(
        entry.model,
        preferences,
        entry.capability,
        entry.value,
        candidates,
      ),
    }),
  );

  return { preferences, costWeight, candidates, results };
};

export const parseMatchParams = (search: string): MatchPreferences => {
  const query = search.includes("?")
    ? search.slice(search.indexOf("?") + 1)
    : search;
  const params = new URLSearchParams(query);
  const task = params.get("task");
  const budget = params.get("budget");
  const context = params.get("context");
  const open = params.get("open");

  return {
    task: isTaskKey(task) ? task : DEFAULT_MATCH_PREFERENCES.task,
    budget: isBudgetKey(budget) ? budget : DEFAULT_MATCH_PREFERENCES.budget,
    context: isContextKey(context) ? context : DEFAULT_MATCH_PREFERENCES.context,
    openOnly: open === "1" || open?.toLowerCase() === "true",
  };
};

/** Serializes validated preferences, omitting every default value. */
export const serializeMatchParams = (preferences: MatchPreferences): string => {
  const params = new URLSearchParams();

  if (preferences.task !== DEFAULT_MATCH_PREFERENCES.task) {
    params.set("task", preferences.task);
  }
  if (preferences.budget !== DEFAULT_MATCH_PREFERENCES.budget) {
    params.set("budget", preferences.budget);
  }
  if (preferences.context !== DEFAULT_MATCH_PREFERENCES.context) {
    params.set("context", preferences.context);
  }
  if (preferences.openOnly) params.set("open", "1");

  return params.toString();
};

export const compareHref = (slugs: readonly string[]): string =>
  `/compare/?models=${slugs.map((slug) => encodeURIComponent(slug)).join(",")}`;