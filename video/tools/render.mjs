// Render film.html to 60 fps: 4 subframes per frame, averaged in-process and
// piped to ffmpeg as raw RGB (an ffmpeg tmix + select chain dropped frames on
// image2pipe input). Workers render disjoint frame ranges in parallel; segments
// are concatenated losslessly at the end.
//   node tools/render.mjs [workers=6] [fromFrame=0] [toFrame=1800]
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { spawn, execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { serve } from "./serve.mjs";
import { PNG } from "pngjs";

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
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1440x1440", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", "-g", "60",
    file,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const started = Date.now();
  const N = 1440 * 1440;
  const acc = new Uint16Array(N * 3);
  for (let f = f0; f < f1; f++) {
    // Average the subframes here (the same blend as ffmpeg tmix), then send one
    // raw frame: the output can never gain or lose frames.
    acc.fill(0);
    for (let s = 0; s < SUB; s++) {
      const t = (f + (s + 0.5) / SUB) / FPS;
      await page.evaluate((tt) => window.seek(tt), t);
      const d = PNG.sync.read(await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1440, height: 1440 } })).data;
      for (let i = 0, j = 0; i < N; i++, j += 4) {
        acc[i * 3] += d[j]; acc[i * 3 + 1] += d[j + 1]; acc[i * 3 + 2] += d[j + 2];
      }
    }
    const frame = Buffer.allocUnsafe(N * 3);
    for (let i = 0; i < N * 3; i++) frame[i] = (acc[i] + SUB / 2) / SUB;
    if (!ff.stdin.write(frame)) await new Promise((ok) => ff.stdin.once("drain", ok));
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
