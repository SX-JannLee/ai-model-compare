import { describe, expect, it } from "vitest";
import { getModel, models } from "@/data/models";
import {
  BUDGET_COST_WEIGHTS,
  DEFAULT_MATCH_PREFERENCES,
  buildValueScores,
  capabilityFor,
  compareHref,
  costWeightFor,
  filterCandidates,
  parseMatchParams,
  preferencesEqual,
  recommend,
  serializeMatchParams,
  type MatchPreferences,
} from "@/lib/match";

const prefs = (
  overrides: Partial<MatchPreferences> = {},
): MatchPreferences => ({ ...DEFAULT_MATCH_PREFERENCES, ...overrides });

describe("match preferences and filtering", () => {
  it("uses balanced defaults", () => {
    expect(DEFAULT_MATCH_PREFERENCES).toEqual({
      task: "balanced",
      budget: "balanced",
      context: "any",
      openOnly: false,
    });
  });

  it("passes every model by default", () => {
    expect(filterCandidates(DEFAULT_MATCH_PREFERENCES)).toHaveLength(models.length);
  });

  it("filters to open-weight models only", () => {
    const candidates = filterCandidates(prefs({ openOnly: true }));
    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(candidates.every((model) => model.openWeights)).toBe(true);
    expect(candidates.map((model) => model.slug)).not.toContain("claude-fable-5-2");
  });

  it("filters by 200K and 1M context windows", () => {
    const long200 = filterCandidates(prefs({ context: "long200" }));
    expect(long200.every((model) => model.contextK >= 200)).toBe(true);

    const long1m = filterCandidates(prefs({ context: "long1m" }));
    expect(long1m.every((model) => model.contextK >= 1000)).toBe(true);
    expect(long1m).toHaveLength(14);
    expect(long1m.map((model) => model.slug)).not.toContain("grok-4-7");
    expect(long1m.map((model) => model.slug)).not.toContain("qwen4-max");
  });

  it("combines open weights and 1M context", () => {
    const candidates = filterCandidates(
      prefs({ openOnly: true, context: "long1m" }),
    );
    expect(candidates).toHaveLength(4);
    expect(candidates.every((model) => model.openWeights)).toBe(true);
    expect(candidates.every((model) => model.contextK >= 1000)).toBe(true);
  });

  it("keeps fewer than three passing models instead of padding", () => {
    const kimi = getModel("kimi-k3-1-pro")!;
    const deepseek = getModel("deepseek-v4-1-flash-1017")!;
    const outcome = recommend(prefs({ openOnly: true }), [kimi, deepseek]);
    expect(outcome.candidates).toHaveLength(2);
    expect(outcome.results).toHaveLength(2);
    expect(outcome.results.map((result) => result.rank)).toEqual([1, 2]);
  });

  it("returns an empty outcome when nothing passes", () => {
    const closed = getModel("gpt-6-2-astra")!;
    const outcome = recommend(prefs({ openOnly: true }), [closed]);
    expect(outcome.candidates).toHaveLength(0);
    expect(outcome.results).toHaveLength(0);
  });
});

describe("scoring", () => {
  it("maps budget preferences to the documented cost weights", () => {
    expect(BUDGET_COST_WEIGHTS).toEqual({
      quality: 0.1,
      balanced: 0.25,
      value: 0.45,
    });
    expect(costWeightFor("quality")).toBe(0.1);
    expect(costWeightFor("balanced")).toBe(0.25);
    expect(costWeightFor("value")).toBe(0.45);
  });

  it("uses intelligence for balanced and a 60/40 blend for a task", () => {
    const model = getModel("claude-fable-5-2")!;
    expect(capabilityFor(model, "balanced")).toBe(model.intelligence);
    expect(capabilityFor(model, "coding")).toBeCloseTo(
      0.6 * model.scores.coding + 0.4 * model.intelligence,
      10,
    );
    expect(capabilityFor(model, "coding")).toBeCloseTo(55.2, 5);
  });

  it("normalizes value against every model on a log scale", () => {
    const value = buildValueScores(models);

    expect(value.get("deepseek-v4-1-flash-1017")).toBeCloseTo(100, 10);
    expect(value.get("claude-fable-5-2")).toBeCloseTo(0, 10);

    const byCost = [...models].sort((a, b) => a.costPerTask - b.costPerTask);
    for (let index = 1; index < byCost.length; index += 1) {
      const previous = value.get(byCost[index - 1].slug)!;
      const current = value.get(byCost[index].slug)!;
      expect(previous).toBeGreaterThanOrEqual(current);
    }

    for (const model of models) {
      const score = value.get(model.slug)!;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("computes the rounded match score from capability and value", () => {
    const preferences = prefs({ task: "coding", budget: "value" });
    const value = buildValueScores(models);
    const outcome = recommend(preferences);
    const model = getModel("gpt-6-2-sol")!;
    const result = recommend(preferences, models, models.length).results.find(
      (item) => item.model.slug === model.slug,
    )!;
    const expected =
      Math.round(
        ((1 - 0.45) * capabilityFor(model, "coding") +
          0.45 * value.get(model.slug)!) *
          10,
      ) / 10;

    expect(result.matchScore).toBeCloseTo(expected, 10);
    expect(outcome.results).toHaveLength(3);
  });

  it("reports the raw task score and intelligence fallback", () => {
    const coding = recommend(prefs({ task: "coding" }), models, models.length);
    for (const result of coding.results) {
      expect(result.taskScore).toBe(result.model.scores.coding);
      expect(result.capability).toBeCloseTo(
        0.6 * result.model.scores.coding + 0.4 * result.model.intelligence,
        10,
      );
    }

    const balanced = recommend(DEFAULT_MATCH_PREFERENCES, models, models.length);
    for (const result of balanced.results) {
      expect(result.taskScore).toBe(result.model.intelligence);
      expect(result.capability).toBe(result.model.intelligence);
    }
  });

  it("sorts by match score, then intelligence, then cost per task", () => {
    const outcome = recommend(
      prefs({ task: "agentic", budget: "balanced" }),
      models,
      models.length,
    );

    for (let index = 1; index < outcome.results.length; index += 1) {
      const previous = outcome.results[index - 1];
      const current = outcome.results[index];
      if (previous.matchScore !== current.matchScore) {
        expect(previous.matchScore).toBeGreaterThan(current.matchScore);
        continue;
      }
      if (previous.model.intelligence !== current.model.intelligence) {
        expect(previous.model.intelligence).toBeGreaterThan(
          current.model.intelligence,
        );
        continue;
      }
      expect(previous.model.costPerTask).toBeLessThanOrEqual(
        current.model.costPerTask,
      );
    }
  });

  it("returns exactly the top three with contiguous ranks", () => {
    const outcome = recommend(prefs({ context: "long1m" }));
    expect(outcome.results).toHaveLength(3);
    expect(outcome.results.map((result) => result.rank)).toEqual([1, 2, 3]);
    for (const result of outcome.results) {
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
      expect(result.reasons.length).toBeLessThanOrEqual(3);
    }
  });

  it("shifts recommendations toward cheaper models as cost weight rises", () => {
    const quality = recommend(prefs({ budget: "quality" })).results;
    const value = recommend(prefs({ budget: "value" })).results;
    expect(value[0].model.slug).not.toBe(quality[0].model.slug);
    expect(value[0].model.costPerTask).toBeLessThan(
      quality[0].model.costPerTask,
    );
    expect(quality[0].model.intelligence).toBeGreaterThanOrEqual(
      value[0].model.intelligence,
    );
  });

  it("explains results with task, cost and licence/context reasons", () => {
    const outcome = recommend(
      prefs({ task: "coding", openOnly: true, context: "long1m" }),
    );
    expect(outcome.results.length).toBe(3);
    for (const result of outcome.results) {
      const text = result.reasons.join(" ");
      expect(text).toContain("编程");
      expect(text).toContain("单任务成本");
      expect(text).toContain("开源权重");
    }
  });

  it("builds a compare URL for the current top three", () => {
    const { results } = recommend(DEFAULT_MATCH_PREFERENCES);
    const href = compareHref(results.map((result) => result.model.slug));
    const slugs = href.replace("/compare/?models=", "").split(",");
    expect(slugs).toEqual(results.map((result) => result.model.slug));
    expect(href.startsWith("/compare/?models=")).toBe(true);
  });
});

describe("URL state", () => {
  it("parses a fully specified share URL", () => {
    expect(
      parseMatchParams("?task=coding&budget=value&context=long1m&open=1"),
    ).toEqual({
      task: "coding",
      budget: "value",
      context: "long1m",
      openOnly: true,
    });
  });

  it("falls back to balanced defaults for missing or invalid values", () => {
    expect(parseMatchParams("")).toEqual(DEFAULT_MATCH_PREFERENCES);
    expect(
      parseMatchParams("?task=nope&budget=cheap&context=2m&open=maybe"),
    ).toEqual(DEFAULT_MATCH_PREFERENCES);
  });

  it("ignores invalid values but keeps valid siblings", () => {
    expect(parseMatchParams("?task=science&budget=free&open=true")).toEqual({
      task: "science",
      budget: "balanced",
      context: "any",
      openOnly: true,
    });
  });

  it("serializes non-default values in a stable order", () => {
    expect(
      serializeMatchParams({
        task: "coding",
        budget: "value",
        context: "long1m",
        openOnly: true,
      }),
    ).toBe("task=coding&budget=value&context=long1m&open=1");
  });

  it("omits defaults and round-trips every preference combination", () => {
    expect(serializeMatchParams(DEFAULT_MATCH_PREFERENCES)).toBe("");

    const variants: MatchPreferences[] = [
      prefs({ task: "reasoning" }),
      prefs({ budget: "quality" }),
      prefs({ context: "long200" }),
      prefs({ openOnly: true }),
      prefs({ task: "office", budget: "value", context: "long1m", openOnly: true }),
    ];

    for (const variant of variants) {
      const query = serializeMatchParams(variant);
      expect(parseMatchParams(`?${query}`)).toEqual(variant);
      expect(preferencesEqual(parseMatchParams(query), variant)).toBe(true);
    }
  });
});