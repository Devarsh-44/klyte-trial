// One frame per beat -> contact sheets. node tools/beat-sheet.mjs [offset=0.3] [from=0] [to=59]
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { serve } from "./serve.mjs";

const offset = Number(process.argv[2] ?? 0.3);
const from = Number(process.argv[3] ?? 0), to = Number(process.argv[4] ?? 59);
const dir = resolve(import.meta.dirname, "../out/beats");
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

const server = await serve(4174);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1440 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4174/film.html");
await page.evaluate(() => window.ready);

let n = 0;
for (let b = from; b <= to; b++) {
  const beat = b + offset;
  await page.evaluate((t) => window.seek(t), beat * 0.5);
  await page.locator("#frame").screenshot({ path: resolve(dir, `f${String(n++).padStart(3, "0")}.png`) });
}
await browser.close();
server.close();

execFileSync(ffmpegPath, [
  "-y", "-loglevel", "error", "-framerate", "1", "-i", resolve(dir, "f%03d.png"),
  "-vf", `scale=288:288,drawtext=text='%{eif\\:n+${from}\\:d}':x=8:y=8:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.6,tile=10x${Math.ceil(n / 10)}:padding=4:color=gray`,
  "-frames:v", "1", resolve(dir, "sheet.png"),
]);
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "no page errors");
console.log(resolve(dir, "sheet.png"));
