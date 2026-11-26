import { chromium } from "playwright";

const [url, output, width = "1440", height = "900", mode = "viewport"] =
  process.argv.slice(2);

if (!url || !output) {
  console.error(
    "Usage: node scripts/capture.mjs <url> <output.png> [width] [height] [viewport|full]",
  );
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
  deviceScaleFactor: 1,
});

await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({
  path: output,
  fullPage: mode === "full",
});
await browser.close();
console.log(`Saved ${output}`);