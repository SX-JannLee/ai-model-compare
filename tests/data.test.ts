import { describe, expect, it } from "vitest";
import {
  CATALOG_DATE,
  DIMENSIONS,
  dimensionLeader,
  formatContext,
  formatPrice,
  getModel,
  modelRank,
  models,
  VENDOR_COLORS,
} from "@/data/models";
import { news } from "@/data/news";
import { absoluteUrl, canonicalFor, SITE } from "@/lib/site";

describe("model dataset", () => {
  it("contains the expected number of frontier models", () => {
    expect(models).toHaveLength(16);
  });

  it("has unique slugs and names", () => {
    expect(new Set(models.map((model) => model.slug)).size).toBe(models.length);
    expect(new Set(models.map((model) => model.name)).size).toBe(models.length);
  });

  it("is sorted by intelligence descending", () => {
    for (let index = 1; index < models.length; index += 1) {
      expect(models[index - 1].intelligence).toBeGreaterThanOrEqual(
        models[index].intelligence,
      );
    }
  });

  it("has complete, in-range capability scores", () => {
    for (const model of models) {
      expect(model.intelligence).toBeGreaterThan(0);
      expect(model.intelligence).toBeLessThanOrEqual(100);
      for (const dimension of DIMENSIONS) {
        const value = model.scores[dimension.key];
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("has sane pricing, context, speed and task cost", () => {
    for (const model of models) {
      expect(model.priceInput).toBeGreaterThan(0);
      expect(model.priceOutput).toBeGreaterThan(0);
      expect(model.contextK).toBeGreaterThanOrEqual(100);
      expect(model.speed).toBeGreaterThan(0);
      expect(model.costPerTask).toBeGreaterThan(0);
    }
  });

  it("has a known vendor color for every model", () => {
    for (const model of models) {
      expect(VENDOR_COLORS[model.vendor]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("keeps official links on https or null", () => {
    for (const model of models) {
      if (model.officialUrl) {
        expect(model.officialUrl.startsWith("https://")).toBe(true);
      }
      expect(model.aaUrl.startsWith("https://artificialanalysis.ai/")).toBe(true);
    }
  });

  it("resolves lookups and ranks", () => {
    expect(getModel("claude-fable-5-2")?.name).toBe("Claude Fable 5.2");
    expect(modelRank("claude-fable-5-2")).toBe(1);
    expect(modelRank("mistral-large-4")).toBe(models.length);
    expect(getModel("does-not-exist")).toBeUndefined();
  });

  it("finds a leader for every dimension", () => {
    for (const dimension of DIMENSIONS) {
      const leader = dimensionLeader(dimension.key);
      expect(leader).toBeTruthy();
      const max = Math.max(...models.map((model) => model.scores[dimension.key]));
      expect(leader.scores[dimension.key]).toBe(max);
    }
  });

  it("formats prices and context windows", () => {
    const model = getModel("claude-fable-5-2")!;
    expect(formatPrice(model)).toBe("$8 / $40");
    expect(formatContext(1000)).toBe("1M");
    expect(formatContext(1049)).toBe("1M");
  });
});

describe("news dataset", () => {
  it("is sorted from newest to oldest", () => {
    for (let index = 1; index < news.length; index += 1) {
      expect(news[index - 1].date >= news[index].date).toBe(true);
    }
  });

  it("has valid dates and https sources", () => {
    for (const item of news) {
      expect(item.date).toMatch(/^2026-\d{2}-\d{2}$/);
      expect(item.url.startsWith("https://")).toBe(true);
      expect(item.title.length).toBeGreaterThan(4);
      expect(item.summary.length).toBeGreaterThan(20);
      expect(new Date(`${item.date}T00:00:00Z`).toString()).not.toBe("Invalid Date");
    }
  });
});

describe("site metadata", () => {
  it("uses the documented snapshot date", () => {
    expect(CATALOG_DATE).toBe("2026-11-26");
    expect(SITE.dataDate).toBe(CATALOG_DATE);
  });

  it("builds absolute URLs and canonicals", () => {
    expect(absoluteUrl("/models/")).toBe(
      `${SITE.url}${SITE.basePath}/models/`,
    );
    expect(canonicalFor("/")).toBe(`${SITE.url}${SITE.basePath}/`);
    expect(absoluteUrl("models/")).toContain("/models/");
  });
});