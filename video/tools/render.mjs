// Render film.html to 60 fps: 4 subframes per frame, blended with ffmpeg tmix.
// Workers render disjoint frame ranges in parallel and pipe PNGs straight into
// ffmpeg (no frames on disk); segments are concatenated losslessly at the end.
//   node tools/render.mjs [workers=6] [fromFrame=0] [toFrame=1800]
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { spawn, execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { serve } from "./serve.mjs";

const FPS = 60, SUB = 4;
const WORKERS = Number(process.argv[2] ?? 6);
const FROM = Number(process.argv[3] ?? 0), TO = Number(process.argv[4] ?? 30 * FPS);
const outDir = resolve(import.meta.dirname, "../out");
const segDir = resolve(outDir, "segments");
await mkdir(segDir, { recursive: true });

const server = await serve(4175);
const browser = await chromium.launch();

async function renderRange(id, f0, f1) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1440 } });
  page.on("pageerror", (e) => console.error(`[w${id}] pageerror: ${e.message}`));
  await page.goto("http://127.0.0.1:4175/film.html");
  await page.evaluate(() => window.ready);
  const file = resolve(segDir, `seg-${String(f0).padStart(5, "0")}.mp4`);
  const ff = spawn(ffmpegPath, [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS * SUB), "-c:v", "png", "-i", "-",
    "-vf", `tmix=frames=${SUB}:weights='1 1 1 1',select='not(mod(n+1\\,${SUB}))',setpts=N/(${FPS}*TB)`,
    "-r", String(FPS), "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", "-g", "60",
    file,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const started = Date.now();
  for (let f = f0; f < f1; f++) {
    for (let s = 0; s < SUB; s++) {
      const t = (f + (s + 0.5) / SUB) / FPS;
      await page.evaluate((tt) => window.seek(tt), t);
      const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1440, height: 1440 } });
      if (!ff.stdin.write(png)) await new Promise((ok) => ff.stdin.once("drain", ok));
    }
    if ((f - f0) % 30 === 29) {
      const done = f - f0 + 1, rate = done / ((Date.now() - started) / 1000);
      console.log(`[w${id}] frame ${f + 1}/${f1}  ${rate.toFixed(2)} fps  eta ${((f1 - f - 1) / rate / 60).toFixed(1)} min`);
    }
  }
  ff.stdin.end();
  await new Promise((ok, bad) => ff.on("close", (c) => (c === 0 ? ok() : bad(new Error(`ffmpeg ${c}`)))));
  await page.close();
  return file;
}

const total = TO - FROM;
const per = Math.ceil(total / WORKERS);
const jobs = [];
for (let i = 0; i < WORKERS; i++) {
  const a = FROM + i * per, b = Math.min(TO, a + per);
  if (a < b) jobs.push(renderRange(i, a, b));
}
const files = await Promise.all(jobs);
await browser.close();
server.close();

const list = resolve(segDir, "list.txt");
await writeFile(list, files.sort().map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"));
const silent = resolve(outDir, "klyte-film-silent.mp4");
execFileSync(ffmpegPath, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent]);
console.log(`done -> ${silent}`);
