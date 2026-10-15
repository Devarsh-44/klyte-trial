import * as THREE from "three";
import type { Flavor } from "@/lib/data";

/**
 * Paints a can wrap onto a 2D canvas and returns it as a Three texture.
 *
 * Canvas aspect matches the label cylinder's unrolled surface
 * (circumference / height ≈ 1.25) so nothing stretches. The front of the can
 * is the horizontal centre of the canvas. Colours and layout follow the real
 * Klyte cans from the brand films: two-tone gradient, white bubble wordmark,
 * flavor name stacked to its right, white small print.
 */
export const LABEL_W = 2048;
export const LABEL_H = 1640;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function paintLabel(canvas: HTMLCanvasElement, flavor: Flavor) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const mono =
    getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() ||
    "ui-monospace, monospace";
  const W = LABEL_W;
  const H = LABEL_H;
  const cx = W / 2;
  const { top, mid, bottom, stroke } = flavor.can;

  ctx.clearRect(0, 0, W, H);

  // Two-tone gradient, the Klyte can signature.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(0.38, top);
  g.addColorStop(0.62, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Soft horizontal falloff so the print reads as wrapped metal.
  const sheen = ctx.createLinearGradient(0, 0, W, 0);
  sheen.addColorStop(0, "rgba(0,0,0,0.22)");
  sheen.addColorStop(0.5, "rgba(0,0,0,0)");
  sheen.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Top band tagline.
  ctx.font = `600 34px ${mono}`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.textBaseline = "middle";
  const tag = "OUTGROW THE ORDINARY      ";
  const tagW = ctx.measureText(tag).width;
  for (let x = 0; x < W; x += tagW) ctx.fillText(tag, x, 54);

  // Wordmark: white bubble letters with a deep outline.
  ctx.save();
  ctx.translate(cx - 70, 660);
  ctx.rotate(-0.08);
  ctx.font = '400 380px "Titan One", "Anton", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.lineWidth = 34;
  ctx.strokeStyle = stroke;
  ctx.strokeText("klyte", 0, 0);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("klyte", 0, 0);
  ctx.restore();

  // Flavor name, stacked, to the right of the wordmark (as on the real can).
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = '400 92px "Anton", Impact, sans-serif';
  ctx.fillStyle = "#FFFFFF";
  const words = flavor.name.toUpperCase().split(" ");
  words.forEach((w, i) => ctx.fillText(w, cx + 400, 560 + i * 100));

  // Small print.
  ctx.font = `600 40px ${mono}`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("SPARKLING", cx - 330, 930);
  ctx.fillText("ELECTROLYTE", cx - 330, 980);

  // "No added sugar" roundel.
  ctx.save();
  ctx.translate(cx - 230, 1140);
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = `700 30px ${mono}`;
  ctx.fillText("NO", 0, -22);
  ctx.fillText("ADDED", 0, 14);
  ctx.fillText("SUGAR", 0, 50);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.font = `600 34px ${mono}`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("NET CONTENT", cx - 330, 1380);
  ctx.font = '400 64px "Anton", Impact, sans-serif';
  ctx.fillText("250ML", cx - 330, 1450);

  // Back panel: compact nutrition block.
  const bx = 150;
  ctx.font = `600 30px ${mono}`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const rows = [
    ["NUTRITION / 250ML", ""],
    ["CAFFEINE", "0 MG"],
    ["ADDED SUGAR", "0 G"],
    ["ELECTROLYTES", "5"],
    ["VIT B6 B12 C", "YES"],
  ];
  rows.forEach(([k, v], i) => {
    const y = 520 + i * 74;
    ctx.fillText(k, bx, y);
    ctx.textAlign = "right";
    ctx.fillText(v, bx + 420, y);
    ctx.textAlign = "left";
    ctx.fillRect(bx, y + 22, 420, 2);
  });

  // Light condensation, kept subtle.
  const rnd = mulberry32(flavor.id.length * 977);
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W;
    const y = 110 + rnd() * (H - 130);
    const r = 3 + Math.pow(rnd(), 3) * 14;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fill();
  }
}

export function createLabelTexture(flavor: Flavor) {
  const canvas = document.createElement("canvas");
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;
  paintLabel(canvas, flavor);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  return { canvas, tex };
}
