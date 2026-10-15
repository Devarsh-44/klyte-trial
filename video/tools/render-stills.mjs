// Render named stills from film.html: node tools/render-stills.mjs [beat ...]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { serve } from "./serve.mjs";

const STILLS = { open: 1.6, glass: 19.3, stage: 32.7, wall: 49.6, pour: 44.15 };
const extra = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const jobs = extra.length ? extra.map((b) => [`beat-${b}`, b]) : Object.entries(STILLS);

const outDir = resolve(import.meta.dirname, "../out/stills");
await mkdir(outDir, { recursive: true });
const server = await serve(4173);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1440 } });
page.on("pageerror", (e) => console.error("pageerror:", e.message));
page.on("console", (m) => m.type() === "error" && console.error("console:", m.text()));
await page.goto("http://127.0.0.1:4173/film.html");
await page.evaluate(() => window.ready);

for (const [name, beat] of jobs) {
  await page.evaluate((t) => window.seek(t), beat * 0.5);
  const file = resolve(outDir, `${name}.png`);
  await page.locator("#frame").screenshot({ path: file });
  console.log(`${name} (beat ${beat}) -> ${file}`);
}
await browser.close();
server.close();
