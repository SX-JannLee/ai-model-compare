import { chromium } from "playwright";

const base = (process.argv[2] ?? "http://127.0.0.1:4173/ai-model-compare").replace(
  /\/$/,
  "",
);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

let failures = 0;
const check = (condition, label, detail = "") => {
  if (condition) {
    console.log(`ok   ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

const searchParams = () => new URL(page.url()).searchParams;
const readClipboard = async () => {
  try {
    return await page.evaluate(() => navigator.clipboard.readText());
  } catch {
    return "";
  }
};

// --- /match/ ---
await page.goto(`${base}/match/`, { waitUntil: "networkidle" });
await page.waitForSelector('input[name="match-task"]:checked');
check((await page.locator("h1").first().textContent()).includes("看榜"), "match h1");
check(
  (await page.locator('ol li[class*="card"]').count()) === 3,
  "match renders three defaults",
);

await page.getByText("编程", { exact: true }).first().click();
await page.waitForFunction(() =>
  window.location.search.includes("task=coding"),
);
check(searchParams().get("task") === "coding", "match task URL state");

await page.getByText("性价比优先", { exact: true }).click();
await page.waitForFunction(() =>
  window.location.search.includes("budget=value"),
);
check(searchParams().get("budget") === "value", "match budget URL state");

await page.getByText("≥ 1M", { exact: true }).click();
await page.waitForFunction(() =>
  window.location.search.includes("context=long1m"),
);
check(searchParams().get("context") === "long1m", "match context URL state");

await page.getByText("只看开源权重", { exact: true }).click();
await page.waitForFunction(() => window.location.search.includes("open=1"));
check(searchParams().get("open") === "1", "match open-weights URL state");

const matchShareUrl = page.url();
await page.getByRole("button", { name: "复制分享链接" }).click();
await page.waitForTimeout(150);
const matchClipboard = await readClipboard();
check(
  matchClipboard === page.url() || matchClipboard.includes("task=coding"),
  "match copy produces a shareable URL",
  matchClipboard.slice(0, 120),
);

await page.goto(matchShareUrl, { waitUntil: "networkidle" });
await page.waitForSelector('input[name="match-task"]:checked');
check(
  (await page.locator('input[name="match-task"]:checked').inputValue()) ===
    "coding",
  "match shared URL restores task",
);
check(
  (await page.locator('input[name="match-budget"]:checked').inputValue()) ===
    "value",
  "match shared URL restores budget",
);
check(
  (await page.locator('input[name="match-context"]:checked').inputValue()) ===
    "long1m",
  "match shared URL restores context",
);
check(
  await page.locator('input[type="checkbox"]').isChecked(),
  "match shared URL restores open-only",
);

// --- /compare/ ---
await page.goto(
  `${base}/compare/?models=claude-fable-5-2,kimi-k3-1-pro`,
  { waitUntil: "networkidle" },
);
await page.waitForFunction(() =>
  document.querySelectorAll('.compare-chips button[aria-pressed="true"]').length === 2,
);
const selectedNames = await page
  .locator('.compare-chips button[aria-pressed="true"]')
  .allTextContents();
check(
  selectedNames.some((name) => name.includes("Claude Fable 5.2")) &&
    selectedNames.some((name) => name.includes("Kimi K3.1 Pro")),
  "compare shared URL restores two selected models",
  selectedNames.join(" | "),
);
check(
  (await page.locator(".compare-table thead th").count()) === 3,
  "compare table has metric + two model columns",
);

await page
  .locator(".compare-chips button")
  .filter({ hasText: "GPT-6.2 Sol" })
  .click();
await page.waitForFunction(() =>
  window.location.search.includes("gpt-6-2-sol"),
);
check(
  searchParams().get("models")?.split(",").length === 3,
  "compare toggle updates URL to three models",
  searchParams().get("models") ?? "",
);

await page.getByRole("button", { name: "复制对比链接" }).click();
await page.waitForTimeout(150);
const compareClipboard = await readClipboard();
check(
  compareClipboard.startsWith("http") &&
    compareClipboard.includes("models=") &&
    compareClipboard.includes("gpt-6-2-sol"),
  "compare copy produces an absolute shareable URL",
  compareClipboard.slice(0, 120),
);

await page.getByRole("button", { name: "重置选择" }).click();
await page.waitForTimeout(100);
const afterReset = await page
  .locator('.compare-chips button[aria-pressed="true"]')
  .allTextContents();
check(afterReset.length === 3, "compare reset restores three defaults", afterReset.join(" | "));

// --- /changelog/ ---
await page.goto(`${base}/changelog/`, { waitUntil: "networkidle" });
const changelogText = await page.locator("body").innerText();
check(changelogText.includes("v1.1.0"), "changelog shows v1.1.0");
check(changelogText.includes("v1.0.0"), "changelog shows v1.0.0");
check(
  (await page.locator('a[href*="/match/"]').count()) > 0,
  "changelog links to match wizard",
);

check(errors.length === 0, "no console or page errors", errors.slice(0, 3).join(" | "));

await browser.close();
console.log(
  failures ? `\n${failures} verification failure(s)` : "\nAll v1.1 interaction checks passed",
);
process.exit(failures ? 1 : 0);