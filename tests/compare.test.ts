import { describe, expect, it } from "vitest";
import { getModel, models } from "@/data/models";
import {
  DEFAULT_COMPARE_SLUGS,
  MAX_COMPARE,
  buildCompareUrl,
  buildDefaultCompareUrl,
  normalizeCompareSlugs,
  parseCompareSlugs,
  serializeCompareSlugs,
  toggleCompareSlug,
} from "@/lib/compare";

const defaults = [...DEFAULT_COMPARE_SLUGS];
const validSlugs = models.map((model) => model.slug);

describe("compare defaults", () => {
  it("contains at most three valid, unique models", () => {
    expect(defaults).toHaveLength(3);
    expect(defaults.length).toBeLessThanOrEqual(MAX_COMPARE);
    expect(new Set(defaults).size).toBe(defaults.length);
    for (const slug of defaults) {
      expect(getModel(slug), `${slug} should exist`).toBeDefined();
    }
  });
});

describe("parseCompareSlugs", () => {
  it("parses a valid comma-separated selection in order", () => {
    const expected = ["gemini-4-neon", "claude-opus-5-5", "gpt-6-2-sol"];
    expect(parseCompareSlugs(`?models=${expected.join(",")}`)).toEqual(expected);
  });

  it("accepts a single model", () => {
    expect(parseCompareSlugs("?models=glm-5-3")).toEqual(["glm-5-3"]);
  });

  it("falls back to the default trio when the value is missing or empty", () => {
    for (const search of ["", "?", "?foo=bar", "?models=", "?models=,,,", "?models=%20%20"]) {
      expect(parseCompareSlugs(search), search).toEqual(defaults);
    }
  });

  it("filters unknown slugs while keeping the valid ones", () => {
    expect(
      parseCompareSlugs("?models=gemini-4-neon,not-a-model,glm-5-3"),
    ).toEqual(["gemini-4-neon", "glm-5-3"]);
  });

  it("falls back to defaults when every slug is unknown", () => {
    expect(parseCompareSlugs("?models=not-a-model,also-missing")).toEqual(
      defaults,
    );
  });

  it("removes duplicates and preserves first-seen order", () => {
    expect(
      parseCompareSlugs(
        "?models=gpt-6-2-sol,gpt-6-2-sol,glm-5-3,gpt-6-2-sol",
      ),
    ).toEqual(["gpt-6-2-sol", "glm-5-3"]);
  });

  it("keeps at most three unique models when the input is oversized", () => {
    const input = validSlugs.slice(0, 5);
    expect(parseCompareSlugs(`?models=${input.join(",")}`)).toEqual(
      input.slice(0, MAX_COMPARE),
    );
  });

  it("counts unique slugs, not raw entries, towards the cap", () => {
    expect(
      parseCompareSlugs(
        `?models=${validSlugs[0]},${validSlugs[0]},${validSlugs[1]},${validSlugs[2]},${validSlugs[3]}`,
      ),
    ).toEqual(validSlugs.slice(0, 3));
  });

  it("ignores empty or whitespace-only segments and trims entries", () => {
    expect(
      parseCompareSlugs("?models=,gemini-4-neon,,%20glm-5-3%20,"),
    ).toEqual(["gemini-4-neon", "glm-5-3"]);
  });

  it("supports a bare query string and repeated parameters", () => {
    expect(parseCompareSlugs("models=glm-5-3")).toEqual(["glm-5-3"]);
    expect(
      parseCompareSlugs("?models=gemini-4-neon&models=glm-5-3"),
    ).toEqual(["gemini-4-neon", "glm-5-3"]);
  });
});

describe("normalizeCompareSlugs", () => {
  it("keeps only known, unique slugs in order", () => {
    expect(
      normalizeCompareSlugs([
        " gemini-4-neon ",
        "nope",
        "gemini-4-neon",
        "glm-5-3",
      ]),
    ).toEqual(["gemini-4-neon", "glm-5-3"]);
  });

  it("does not substitute defaults when nothing is valid", () => {
    expect(normalizeCompareSlugs(["nope", "", "  "])).toEqual([]);
  });
});

describe("serializeCompareSlugs", () => {
  it("joins a valid selection in order", () => {
    expect(
      serializeCompareSlugs([
        "gemini-4-neon",
        "claude-opus-5-5",
        "gpt-6-2-sol",
      ]),
    ).toBe("gemini-4-neon,claude-opus-5-5,gpt-6-2-sol");
  });

  it("applies the same filtering, de-duplication and cap as parsing", () => {
    expect(
      serializeCompareSlugs([
        "gemini-4-neon",
        "not-a-model",
        "gemini-4-neon",
        "glm-5-3",
        "grok-4-7",
        "qwen4-max",
      ]),
    ).toBe("gemini-4-neon,glm-5-3,grok-4-7");
  });

  it("falls back to the default trio when no valid slug is given", () => {
    expect(serializeCompareSlugs([])).toBe(defaults.join(","));
    expect(serializeCompareSlugs(["not-a-model"])).toBe(defaults.join(","));
  });

  it("round-trips through parse", () => {
    const selection = ["glm-5-3", "gemini-4-neon"];
    expect(parseCompareSlugs(`?models=${serializeCompareSlugs(selection)}`)).toEqual(
      selection,
    );
  });
});
describe("buildCompareUrl", () => {
  const base =
    "https://sx-jannlee.github.io/ai-model-compare/compare/?utm_source=test#radar";

  it("returns an absolute, shareable URL", () => {
    const url = buildCompareUrl(base, ["gemini-4-neon", "glm-5-3"]);
    expect(url.startsWith("https://sx-jannlee.github.io/")).toBe(true);
    expect(url).toContain("models=gemini-4-neon,glm-5-3");
  });

  it("keeps literal commas rather than percent-encoding them", () => {
    const url = buildCompareUrl(base, ["gemini-4-neon", "glm-5-3"]);
    expect(url).not.toContain("%2C");
    expect(new URL(url).searchParams.get("models")).toBe(
      "gemini-4-neon,glm-5-3",
    );
  });

  it("preserves the path, trailing slash, other parameters and hash", () => {
    const url = new URL(buildCompareUrl(base, ["gemini-4-neon"]));
    expect(url.pathname).toBe("/ai-model-compare/compare/");
    expect(url.hash).toBe("#radar");
    expect(url.searchParams.get("utm_source")).toBe("test");
  });

  it("replaces an existing models value and normalises the selection", () => {
    const url = new URL(
      buildCompareUrl(
        "https://example.com/compare/?models=glm-5-3&x=1",
        ["gemini-4-neon", "not-a-model", "gemini-4-neon", "glm-5-3"],
      ),
    );
    expect(url.searchParams.getAll("models")).toEqual([
      "gemini-4-neon,glm-5-3",
    ]);
    expect(url.searchParams.get("x")).toBe("1");
  });

  it("falls back to the default selection and round-trips through parse", () => {
    const selection = ["gpt-6-2-sol", "gemini-4-neon"];
    const url = buildCompareUrl(base, selection);
    expect(parseCompareSlugs(new URL(url).search)).toEqual(selection);
    expect(parseCompareSlugs(new URL(buildCompareUrl(base, [])).search)).toEqual(
      defaults,
    );
  });
});

describe("buildDefaultCompareUrl", () => {
  it("removes the models parameter while preserving the rest of the URL", () => {
    const url = new URL(
      buildDefaultCompareUrl(
        "https://sx-jannlee.github.io/ai-model-compare/compare/?models=glm-5-3&utm_source=test#radar",
      ),
    );
    expect(url.href).toBe(
      "https://sx-jannlee.github.io/ai-model-compare/compare/?utm_source=test#radar",
    );
    expect(url.searchParams.has("models")).toBe(false);
    expect(url.pathname).toBe("/ai-model-compare/compare/");
    expect(url.hash).toBe("#radar");
  });

  it("returns the clean default URL when models was the only parameter", () => {
    expect(
      buildDefaultCompareUrl(
        "https://sx-jannlee.github.io/ai-model-compare/compare/?models=glm-5-3",
      ),
    ).toBe("https://sx-jannlee.github.io/ai-model-compare/compare/");
  });

  it("leaves an already-default URL unchanged", () => {
    const clean = "https://sx-jannlee.github.io/ai-model-compare/compare/";
    expect(buildDefaultCompareUrl(clean)).toBe(clean);
  });
});

describe("toggleCompareSlug", () => {
  const trio = ["claude-fable-5-2", "gpt-6-2-sol", "kimi-k3-1-pro"];

  it("adds a model when fewer than three are selected", () => {
    expect(toggleCompareSlug(trio.slice(0, 2), "glm-5-3")).toEqual([
      ...trio.slice(0, 2),
      "glm-5-3",
    ]);
  });

  it("removes an active chip when more than one is selected", () => {
    expect(toggleCompareSlug(trio, "gpt-6-2-sol")).toEqual([
      "claude-fable-5-2",
      "kimi-k3-1-pro",
    ]);
  });

  it("never removes the last selected model", () => {
    expect(toggleCompareSlug([trio[0]], trio[0])).toEqual([trio[0]]);
  });

  it("replaces the earliest selection when a fourth model is added", () => {
    expect(toggleCompareSlug(trio, "gemini-4-neon")).toEqual([
      "gpt-6-2-sol",
      "kimi-k3-1-pro",
      "gemini-4-neon",
    ]);
  });

  it("ignores unknown slugs", () => {
    expect(toggleCompareSlug(trio, "not-a-model")).toEqual(trio);
    expect(toggleCompareSlug([trio[0]], "not-a-model")).toEqual([trio[0]]);
  });
});
