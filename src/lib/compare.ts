import { models } from "@/data/models";

/** Query-string key that stores the compared model slugs. */
export const COMPARE_PARAM = "models";

/** Maximum number of models that can be compared at once. */
export const MAX_COMPARE = 3;

/** Default trio rendered on the server and used when a selection is unusable. */
export const DEFAULT_COMPARE_SLUGS: readonly string[] = [
  "claude-fable-5-2",
  "gpt-6-2-sol",
  "kimi-k3-1-pro",
];

const MODEL_SLUGS = new Set(models.map((model) => model.slug));

/**
 * Keep only known slugs, trim surrounding whitespace, drop duplicates and cap
 * the result at {@link MAX_COMPARE}. First-seen order is preserved.
 *
 * This is the single normalisation rule shared by parsing and serialising, so
 * a value written to the URL always parses back to the same selection.
 */
export function normalizeCompareSlugs(input: readonly string[]): string[] {
  const normalized: string[] = [];

  for (const raw of input) {
    const slug = raw.trim();
    if (!slug || !MODEL_SLUGS.has(slug) || normalized.includes(slug)) continue;

    normalized.push(slug);
    if (normalized.length === MAX_COMPARE) break;
  }

  return normalized;
}

/**
 * Apply the compare page's chip behaviour: selecting an active chip removes it
 * unless it is the last one; selecting a new chip while full drops the
 * earliest-selected model. Unknown slugs are ignored. Order is preserved.
 */
export function toggleCompareSlug(
  current: readonly string[],
  slug: string,
): string[] {
  if (!MODEL_SLUGS.has(slug)) return [...current];

  if (current.includes(slug)) {
    return current.length <= 1
      ? [...current]
      : current.filter((item) => item !== slug);
  }

  if (current.length >= MAX_COMPARE) {
    return [...current.slice(1), slug];
  }

  return [...current, slug];
}

/** Extract the raw, still-unvalidated `models` value from a search string. */
function readCompareParam(search: string): string {
  const queryStart = search.indexOf("?");
  const query = queryStart === -1 ? search : search.slice(queryStart + 1);
  if (!query) return "";

  const params = new URLSearchParams(query);
  return params.getAll(COMPARE_PARAM).join(",");
}

/**
 * Parse a `window.location.search` value such as
 * `?models=slug-a,slug-b`. Unknown, duplicate and excess slugs are filtered.
 * An empty or fully invalid value falls back to the default trio.
 */
export function parseCompareSlugs(search: string): string[] {
  const normalized = normalizeCompareSlugs(readCompareParam(search).split(","));
  return normalized.length > 0 ? normalized : [...DEFAULT_COMPARE_SLUGS];
}

/**
 * Serialise a selection for the `models` parameter, applying the same
 * normalisation as {@link parseCompareSlugs}. If no valid slug remains, the
 * default trio is serialised so the resulting link always opens a selection.
 */
export function serializeCompareSlugs(slugs: readonly string[]): string {
  const normalized = normalizeCompareSlugs(slugs);
  const selection =
    normalized.length > 0 ? normalized : [...DEFAULT_COMPARE_SLUGS];
  return selection.join(",");
}

/**
 * Rewrite the `models` parameter on a full URL while preserving the origin,
 * path, trailing slash, other query parameters and the hash. Returns an
 * absolute URL so the result can be copied and shared as-is.
 */
function rewriteCompareParam(href: string, value: string | null): string {
  const url = new URL(href);
  const params = new URLSearchParams(url.search);
  params.delete(COMPARE_PARAM);

  const rest = params.toString();
  const serializedValue = value === null ? "" : `${COMPARE_PARAM}=${value}`;

  if (!serializedValue) {
    url.search = rest ? `?${rest}` : "";
  } else {
    url.search = rest ? `?${rest}&${serializedValue}` : `?${serializedValue}`;
  }

  return url.href;
}

/**
 * Build a shareable absolute URL for a selection. The query is assembled by
 * hand so separators stay as literal commas (`?models=a,b,c`) instead of the
 * `%2C` form produced by `URLSearchParams`.
 */
export function buildCompareUrl(
  href: string,
  slugs: readonly string[],
): string {
  return rewriteCompareParam(href, serializeCompareSlugs(slugs));
}

/** Build the default page URL by removing the `models` parameter. */
export function buildDefaultCompareUrl(href: string): string {
  return rewriteCompareParam(href, null);
}