import { describe, expect, it } from "vitest";
import { releaseAnchor, releases } from "@/data/changelog";
import { SITE } from "@/lib/site";

const SEMVER = /^\d+\.\d+\.\d+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const compareSemver = (a: string, b: string): number => {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
};

const isSafeHref = (href: string): boolean =>
  (href.startsWith("/") && !href.startsWith("//")) ||
  href.startsWith("https://");

describe("changelog releases", () => {
  it("has unique versions in descending semantic order", () => {
    const versions = releases.map((release) => release.version);
    expect(new Set(versions).size).toBe(versions.length);
    expect(versions.length).toBeGreaterThanOrEqual(2);

    for (let index = 1; index < releases.length; index += 1) {
      expect(compareSemver(releases[index - 1].version, releases[index].version)).toBeGreaterThan(0);
    }
  });

  it("is sorted newest first and uses valid ISO dates", () => {
    for (let index = 0; index < releases.length; index += 1) {
      const release = releases[index];
      expect(release.date).toMatch(ISO_DATE);
      const parsed = new Date(`${release.date}T00:00:00Z`);
      expect(Number.isNaN(parsed.getTime())).toBe(false);
      expect(parsed.toISOString()).toBe(`${release.date}T00:00:00.000Z`);

      if (index > 0) {
        expect(releases[index - 1].date >= release.date).toBe(true);
      }
    }
  });

  it("uses semver and keeps required release copy", () => {
    for (const release of releases) {
      expect(release.version).toMatch(SEMVER);
      expect(release.title.trim().length).toBeGreaterThan(0);
      expect(release.summary.trim().length).toBeGreaterThan(20);
      expect(release.highlights.length).toBeGreaterThan(0);
      for (const highlight of release.highlights) {
        expect(highlight.trim().length).toBeGreaterThan(0);
      }
      if (release.fixes) {
        expect(release.fixes.length).toBeGreaterThan(0);
      }
    }
  });

  it("documents the v1.1 selection and shareable-comparison release", () => {
    const v11 = releases.find((release) => release.version === "1.1.0");
    expect(v11).toBeDefined();
    expect(v11!.date).toBe("2026-11-26");
    expect(v11!.highlights.length).toBeGreaterThan(0);

    const copy = [
      v11!.title,
      v11!.summary,
      ...v11!.highlights,
      ...(v11!.fixes ?? []),
    ].join("\n");
    expect(copy).toContain("/match/");
    expect(copy).toContain("/compare/?models=");
    expect(copy).toContain("2026-11-26");
    expect(copy).toContain("静态快照");

    const hrefs = (v11!.links ?? []).map((link) => link.href);
    expect(hrefs).toEqual(
      expect.arrayContaining(["/match/", "/compare/", "/models/", "/benchmarks/"]),
    );
  });

  it("only links to site-relative paths or HTTPS", () => {
    for (const release of releases) {
      for (const link of release.links ?? []) {
        expect(link.label.trim().length).toBeGreaterThan(0);
        expect(isSafeHref(link.href)).toBe(true);
      }
    }
  });

  it("matches the site version and release date", () => {
    expect(SITE.version).toMatch(SEMVER);
    expect(SITE.version).toBe("1.1.0");
    expect(SITE.releaseDate).toBe("2026-11-26");
    expect(releases[0].version).toBe(SITE.version);
    expect(releases[0].date).toBe(SITE.releaseDate);
  });

  it("builds stable anchor ids", () => {
    expect(releaseAnchor("1.1.0")).toBe("v1-1-0");
    expect(releaseAnchor("1.0.0")).toBe("v1-0-0");
    const anchors = releases.map((release) => releaseAnchor(release.version));
    expect(new Set(anchors).size).toBe(anchors.length);
  });
});