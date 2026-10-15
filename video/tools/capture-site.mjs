// Grabs the Klyte site (running on :3000) for the film's browser and product
// scenes: the desktop hero in both flavors, plus the lineup can in both flavors.
import { chromium } from "playwright";
import { resolve } from "node:path";

const out = (name) => resolve(import.meta.dirname, "../assets/site", name);
const URL = process.env.SITE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
await page.goto(URL, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
await page.waitForTimeout(4000);

async function pick(id) {
  const btn = page.locator(`button[role="radio"][data-flavor="${id}"]`);
  if ((await btn.getAttribute("aria-checked")) !== "true") {
    await btn.click();
    await page.waitForTimeout(3500); // let the pour wipe finish
  }
}

for (const id of ["melon-mode", "blueberry-spirulina"]) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await pick(id);
  await page.screenshot({ path: out(`hero-${id}.png`) });
}

// Lineup: the runway maps scroll progress to flavor, so park in each half.
const box = await page.locator("#lineup").boundingBox();
const top = box.y + (await page.evaluate(() => window.scrollY));
const runway = box.height - 900;
for (const [i, id] of ["melon-mode", "blueberry-spirulina"].entries()) {
  await page.evaluate((y) => window.scrollTo(0, y), top + runway * (i + 0.5) / 2);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: out(`lineup-${id}.png`) });
}

// Buy section for the product-card scene.
await page.evaluate(() => document.getElementById("buy").scrollIntoView());
await page.waitForTimeout(1500);
await page.screenshot({ path: out("buy.png") });

// Aligned pair for the flavor slider: reduced motion stops the can floating,
// so both flavors render in exactly the same pose. One WebGL page at a time.
await page.close();
const still = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await still.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
await still.goto(URL, { waitUntil: "networkidle" });
await still.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
await still.waitForTimeout(4000);
for (const id of ["melon-mode", "blueberry-spirulina"]) {
  await still.locator(`button[role="radio"][data-flavor="${id}"]`).click();
  await still.waitForTimeout(2500);
  await still.screenshot({ path: out(`aligned-${id}.png`) });
}

await browser.close();
console.log("done");
