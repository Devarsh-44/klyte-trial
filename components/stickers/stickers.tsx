/**
 * Klyte sticker set, drawn from the brand's Instagram language: holo alien,
 * pixel shades, sparkle, "No Bad Vibes", "LIKE", peace hand, lightning.
 *
 * Sticker rules (the "controlled" part of the system):
 *  1. Stickers only appear at moments of delight: add to cart, newsletter
 *     success, and the final "Outgrow" beat. Never as page decoration.
 *  2. Max three on screen at once.
 *  3. Always a white die-cut border and a soft drop shadow, slapped on with a
 *     quick overshoot (scale 1.25 -> 1, a little rotation).
 */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const CUT = "#FFFFFF";
const INK = "#0A0A0A";

export function AlienSticker(props: P) {
  return (
    <svg viewBox="0 0 120 140" {...props}>
      <defs>
        <linearGradient id="klyte-holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C9B8FF" />
          <stop offset="0.35" stopColor="#9EF5FF" />
          <stop offset="0.7" stopColor="#FFC2F0" />
          <stop offset="1" stopColor="#B4A6FF" />
        </linearGradient>
      </defs>
      <path d="M60 6C30 6 10 30 10 62c0 34 26 70 50 70s50-36 50-70C110 30 90 6 60 6Z" fill="url(#klyte-holo)" stroke={CUT} strokeWidth="8" />
      <path d="M26 62c10-2 24 6 28 22-14 4-30-6-28-22Z" fill={INK} />
      <path d="M94 62c-10-2-24 6-28 22 14 4 30-6 28-22Z" fill={INK} />
      <ellipse cx="36" cy="70" rx="4" ry="3" fill="#fff" opacity=".8" />
      <ellipse cx="84" cy="70" rx="4" ry="3" fill="#fff" opacity=".8" />
    </svg>
  );
}

export function PixelShades(props: P) {
  const rows = ["1111111111111111", "0122111001221110", "0121111001211110", "0011110000111100"];
  const s = 8;
  const w = 16 * s;
  const h = rows.length * s;
  return (
    <svg viewBox={`-5 -5 ${w + 10} ${h + 10}`} {...props}>
      <path d={`M-5 -5H${w + 5}V${2 * s + 5}H${w - s + 5}V${h + 5}H${s - 5}V${2 * s + 5}H-5Z`} fill={CUT} />
      {rows.flatMap((row, y) =>
        row.split("").map((c, x) =>
          c === "0" ? null : (
            <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={c === "2" ? "#FFFFFF" : INK} />
          ),
        ),
      )}
    </svg>
  );
}

export function SparkleSticker(props: P) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <path
        d="M50 4c4 26 20 42 46 46-26 4-42 20-46 46-4-26-20-42-46-46 26-4 42-20 46-46Z"
        fill="#9EF5FF"
        stroke={CUT}
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NoBadVibes(props: P) {
  const t = { textAnchor: "middle" as const, fontFamily: "var(--font-display), Impact, sans-serif", fontSize: 22, fill: "#E6006E" };
  return (
    <svg viewBox="0 0 160 140" {...props}>
      <path d="M80 8 152 132H8L80 8Z" fill="#FFD6E6" stroke={CUT} strokeWidth="8" strokeLinejoin="round" />
      <text x="80" y="74" {...t}>NO</text>
      <text x="80" y="98" {...t}>BAD</text>
      <text x="80" y="122" {...t}>VIBES</text>
    </svg>
  );
}

export function LikePill(props: P) {
  return (
    <svg viewBox="0 0 150 64" {...props}>
      <rect x="4" y="4" width="142" height="56" rx="28" fill="#FFD6E6" stroke={CUT} strokeWidth="6" />
      <text
        x="75"
        y="44"
        textAnchor="middle"
        fontFamily="var(--font-wordmark), sans-serif"
        fontSize="32"
        fill="#FFFFFF"
        stroke="#E6006E"
        strokeWidth="3"
        paintOrder="stroke"
      >
        LIKE
      </text>
    </svg>
  );
}

export function PeaceSticker(props: P) {
  return (
    <svg viewBox="0 0 110 130" {...props}>
      <path
        d="M30 120c-14-6-20-22-18-40l4-22c2-8 14-8 15 1l1 10 -6-52c-1-10 13-12 15-2l8 46 4-48c1-10 15-10 15 0l-3 50 8-6c8-5 16 3 12 11l-8 18c4 2 6 8 4 13l-5 12c-6 16-24 22-50 9Z"
        fill="#C8F24C"
        stroke={CUT}
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path d="M40 78c8-4 20-4 30 2" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function BoltSticker(props: P) {
  return (
    <svg viewBox="0 0 80 120" {...props}>
      <path d="M48 4 10 66h24l-8 50 44-68H44l4-44Z" fill="#FFE600" stroke={CUT} strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
}

export const STICKERS = [AlienSticker, PixelShades, SparkleSticker, NoBadVibes, LikePill, PeaceSticker, BoltSticker];
