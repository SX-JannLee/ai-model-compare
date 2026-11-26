import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:4173";
const outDir = process.argv[3] ?? "docs/evidence";
const browser = await chromium.launch();
const routes = [
  ["/", "home"],
  ["/models/", "models"],
  ["/models/claude-fable-5-2/", "model"],
  ["/match/", "match"],
  ["/compare/", "compare"],
  ["/compare/?models=claude-fable-5-2,kimi-k3-1-pro", "compare-share"],
  ["/changelog/", "changelog"],
  ["/benchmarks/", "benchmarks"],
  ["/news/", "news"],
];
const widths = [1440, 1024, 768, 390];

let failures = 0;

for (const [route, name] of routes) {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);

    const metrics = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const offenders = [];
      for (const element of Array.from(document.querySelectorAll("body *"))) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.right > vw + 1 || rect.left < -1) {
          const style = getComputedStyle(element);
          if (style.position === "fixed") continue;
          offenders.push({
            tag: element.tagName,
            cls: (element.className || "").toString().slice(0, 60),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          });
        }
      }
      const h1 = document.querySelector("h1");
      const h1Rect = h1?.getBoundingClientRect();
      return {
        vw,
        scrollWidth: document.documentElement.scrollWidth,
        pageHeight: document.documentElement.scrollHeight,
        h1: h1?.textContent?.slice(0, 40),
        h1Visible: Boolean(h1Rect && h1Rect.width > 0 && h1Rect.top < 1200),
        offenders: offenders.slice(0, 6),
        fontReady: document.fonts.check('16px "Noto Sans CJK SC"'),
        svgs: document.querySelectorAll("svg").length,
        links: document.querySelectorAll("a").length,
        noScript: document.body.innerHTML.includes("请在浏览器中启用 JavaScript"),
      };
    });

    const overflow = metrics.scrollWidth > metrics.vw + 1;
    const bad = overflow || !metrics.h1Visible || errors.length > 0;
    if (bad) failures += 1;
    console.log(
      `${bad ? "FAIL" : "ok  "} ${name.padEnd(10)} ${String(width).padEnd(5)} h=${metrics.pageHeight} scroll=${metrics.scrollWidth} h1=${metrics.h1Visible ? "yes" : "NO"} font=${metrics.fontReady ? "yes" : "NO"} svg=${metrics.svgs} links=${metrics.links}`,
    );
    if (overflow) console.log("  overflow:", JSON.stringify(metrics.offenders));
    if (errors.length) console.log("  errors:", errors.slice(0, 3));
    await page.close();
  }
}

await mkdir(outDir, { recursive: true });

for (const [route, name, width, height, full] of [
  ["/", "after-home-1440-full", 1440, 900, true],
  ["/", "after-home-1440", 1440, 900, false],
  ["/", "after-home-390-full", 390, 844, true],
  ["/models/", "after-models", 1440, 900, true],
  ["/models/claude-fable-5-2/", "after-model", 1440, 900, true],
  ["/match/", "after-match", 1440, 900, true],
  ["/match/", "after-match-mobile", 390, 844, true],
  ["/compare/", "after-compare", 1440, 900, true],
  ["/compare/?models=claude-fable-5-2,kimi-k3-1-pro", "after-compare-share", 1440, 900, true],
  ["/changelog/", "after-changelog", 1440, 900, true],
  ["/benchmarks/", "after-benchmarks", 1440, 900, false],
  ["/news/", "after-news", 1440, 900, false],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: join(outDir, `${name}.png`),
    fullPage: Boolean(full),
  });
  await page.close();
  console.log(`saved ${join(outDir, `${name}.png`)}`);
}

await browser.close();
console.log(failures ? `\n${failures} failing combinations` : "\nAll layout checks passed");
process.exit(failures ? 1 : 0);