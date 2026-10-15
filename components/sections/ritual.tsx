"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useLenis } from "lenis/react";
import { FLAVORS } from "@/lib/data";
import { AlienSticker, LikePill, NoBadVibes, PixelShades, SparkleSticker } from "@/components/stickers/stickers";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------ *
 * "How it hits" — four beats told sideways while you scroll down.
 * Crack -> Fizz -> Hydrate -> Outgrow. Desktop pins a 100vh frame and
 * scrubs a 4-panel track horizontally; each beat's illustration is driven
 * by the same timeline. Mobile and reduced motion get a vertical stack at
 * the illustrations' end states.
 * ------------------------------------------------------------------------ */

const BEATS = [
  {
    key: "crack",
    word: "Crack.",
    title: "The good kind of tssk.",
    body: "Ice cold, pull the tab, and the afternoon resets. That first hiss is the whole point.",
  },
  {
    key: "fizz",
    word: "Fizz.",
    title: "Fine bubbles, loud flavor.",
    body: "Tight carbonation carries real fruit up front, so it tastes bright without a single gram of added sugar.",
  },
  {
    key: "hydrate",
    word: "Hydrate.",
    title: "Five ions. Zero crash.",
    body: "Sodium, potassium, magnesium, calcium and chloride, with B6, B12 and C. Energy you do not have to pay back.",
  },
  {
    key: "outgrow",
    word: "Outgrow.",
    title: "Then get on with it.",
    body: "Two flavors, one rule: nothing ordinary goes in the can.",
  },
] as const;

/* --------------------------------------------------------- Illustrations -- */

/* Trig is computed once and rounded: server and browser can disagree on the
   last float digit, which React reports as a hydration mismatch. */
const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

const SPRAY_LINES = Array.from({ length: 14 }, (_, i) => {
  const a = rad(-150 + (i * 120) / 13);
  return {
    x1: r2(200 + Math.cos(a) * 40),
    y1: r2(170 + Math.sin(a) * 40),
    x2: r2(200 + Math.cos(a) * 150),
    y2: r2(170 + Math.sin(a) * 150),
  };
});

const SPRAY_DROPS = Array.from({ length: 10 }, (_, i) => {
  const a = rad(-160 + i * 15);
  const d = 70 + (i % 4) * 28;
  return { cx: r2(200 + Math.cos(a) * d), cy: r2(170 + Math.sin(a) * d) };
});

function CrackArt() {
  return (
    <svg viewBox="30 40 340 310" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="lid" cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#F2F4F6" />
          <stop offset="0.6" stopColor="#BFC5CB" />
          <stop offset="1" stopColor="#8A9299" />
        </radialGradient>
        <linearGradient id="rim" x1="0" x2="1">
          <stop offset="0" stopColor="#9AA2A9" />
          <stop offset="0.5" stopColor="#F4F6F8" />
          <stop offset="1" stopColor="#8D959C" />
        </linearGradient>
      </defs>
      {/* spray */}
      <g className="crack-spray" style={{ transformOrigin: "200px 170px" }}>
        {SPRAY_LINES.map((l, i) => (
          <line
            key={i}
            {...l}
            stroke="var(--accent)"
            strokeWidth={i % 3 === 0 ? 3 : 1.5}
            strokeLinecap="round"
            strokeDasharray="2 10"
            opacity={0.8}
          />
        ))}
        {SPRAY_DROPS.map((d, i) => (
          <circle key={`d${i}`} {...d} r={3 + (i % 3)} fill="var(--glow)" />
        ))}
      </g>
      {/* lid */}
      <ellipse cx="200" cy="250" rx="160" ry="84" fill="url(#rim)" />
      <ellipse cx="200" cy="246" rx="146" ry="74" fill="url(#lid)" />
      <ellipse cx="200" cy="246" rx="128" ry="62" fill="none" stroke="#9AA2A9" strokeWidth="2" />
      {/* opening */}
      <path className="crack-mouth" d="M168 196 q32 -18 64 0 q8 20 -6 34 q-26 10 -52 0 q-14 -14 -6 -34z" fill="#1A1C1E" style={{ transformOrigin: "200px 214px" }} />
      {/* rivet */}
      <circle cx="200" cy="256" r="9" fill="#AEB5BB" stroke="#868E95" />
      {/* tab: hinges at the rivet */}
      <g className="crack-tab" style={{ transformOrigin: "200px 256px" }}>
        <path
          d="M162 252 q38 -16 76 0 l10 50 q-48 24 -96 0z"
          fill="#C8CED3"
          stroke="#8D959C"
          strokeWidth="2"
        />
        <ellipse cx="200" cy="292" rx="22" ry="11" fill="#2B2E31" />
      </g>
    </svg>
  );
}

const FIZZ_BUBBLES = Array.from({ length: 26 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  size: 4 + ((i * 7) % 12),
  dur: 2.4 + ((i * 13) % 25) / 10,
  delay: -((i * 17) % 40) / 10,
}));

function FizzArt() {
  return (
    <div className="relative mx-auto h-full max-h-[440px] w-[min(70%,260px)]" aria-hidden>
      {/* glass */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[48px] rounded-t-[14px] border-2 border-fg/25 bg-fg/[0.03]">
        <div
          className="fizz-liquid absolute inset-x-0 bottom-0 h-full origin-bottom"
          style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--glow) 85%, transparent), var(--accent))" }}
        >
          <div className="absolute inset-x-0 top-0 h-3 bg-white/40 blur-[2px]" />
          {FIZZ_BUBBLES.map((b, i) => (
            <span
              key={i}
              className="ritual-bubble absolute bottom-0 rounded-full border border-white/70 bg-white/20"
              style={{
                left: `${b.left}%`,
                width: b.size,
                height: b.size,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-y-4 left-4 w-3 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

const IONS = ["Na", "K", "Mg", "Ca", "Cl"].map((ion, i, all) => {
  const a = (i / all.length) * Math.PI * 2 - Math.PI / 2;
  return { ion, left: `${r2(50 + Math.cos(a) * 37.5)}%`, top: `${r2(50 + Math.sin(a) * 37.5)}%` };
});

function HydrateArt() {
  return (
    <div className="relative mx-auto aspect-square h-auto w-full max-w-[420px]" aria-hidden>
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <circle cx="200" cy="200" r="150" fill="none" stroke="var(--line)" strokeDasharray="3 7" />
        <circle cx="200" cy="200" r="104" fill="none" stroke="var(--line)" />
        <path
          d="M200 104 C 240 156, 262 190, 262 222 a62 62 0 0 1 -124 0 C 138 190, 160 156, 200 104z"
          fill="var(--accent)"
          opacity="0.9"
        />
        <path d="M178 214 a26 26 0 0 0 20 34" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <div className="hydrate-orbit absolute inset-0">
        {IONS.map(({ ion, left, top }) => (
          <span
            key={ion}
            className="absolute grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg font-display text-lg text-fg shadow-sm"
            style={{ left, top }}
          >
            <span className="hydrate-counter">{ion}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function OutgrowArt() {
  return (
    <div className="flex h-full items-end justify-center gap-6 pb-6" aria-hidden>
      {FLAVORS.map((f, i) => (
        <div
          key={f.id}
          className="outgrow-can relative h-[min(52vh,380px)] w-[min(18vw,120px)] rounded-[22px/14px] shadow-2xl"
          style={{
            background: `linear-gradient(180deg, ${f.can.top} 0 42%, ${f.can.mid} 62%, ${f.can.bottom})`,
            transform: `rotate(${i ? 8 : -8}deg)`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-3 rounded-t-[22px] bg-gradient-to-r from-zinc-400 via-zinc-100 to-zinc-400" />
          <div className="absolute inset-x-0 bottom-0 h-2.5 rounded-b-[22px] bg-gradient-to-r from-zinc-500 via-zinc-200 to-zinc-500" />
          <div className="absolute inset-y-6 left-[14%] w-[10%] rounded-full bg-white/25 blur-[1px]" />
          <span className="absolute left-1/2 top-[34%] -translate-x-1/2 -rotate-90 font-wordmark text-[clamp(1.6rem,3vw,2.4rem)] lowercase text-white [-webkit-text-stroke:2px_rgba(0,0,0,0.35)] [paint-order:stroke_fill]">
            klyte
          </span>
          {/* The brand's sticker-bombed look, slapped on as the last beat lands. */}
          {(i === 0
            ? [
                { S: NoBadVibes, c: "left-[-30%] top-[8%] w-[70%]", r: -12 },
                { S: PixelShades, c: "left-[18%] bottom-[16%] w-[80%]", r: 8 },
              ]
            : [
                { S: AlienSticker, c: "right-[-26%] top-[14%] w-[55%]", r: 14 },
                { S: LikePill, c: "right-[-10%] bottom-[22%] w-[85%]", r: -10 },
                { S: SparkleSticker, c: "left-[-18%] top-[52%] w-[34%]", r: 0 },
              ]
          ).map(({ S, c, r }, k) => (
            <span key={k} className={cn("outgrow-sticker absolute drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]", c)}>
              <S className="w-full" style={{ transform: `rotate(${r - (i ? 8 : -8)}deg)` }} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

const ART = { crack: CrackArt, fizz: FizzArt, hydrate: HydrateArt, outgrow: OutgrowArt };

/* --------------------------------------------------------------- Section -- */

export function Ritual() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        // Track: 4 panels -> travel 3 panel widths over 3 time units.
        tl.to(".ritual-track", { xPercent: -75, duration: 3 }, 0);
        tl.fromTo(".ritual-progress", { scaleX: 0.25 }, { scaleX: 1, duration: 3 }, 0);

        // Beat 1: tab lifts, mouth opens, spray blooms.
        tl.fromTo(".crack-tab", { rotate: 0, scaleY: 1 }, { rotate: -8, scaleY: -0.55, duration: 0.45 }, 0.05);
        tl.fromTo(".crack-mouth", { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }, 0.2);
        tl.fromTo(".crack-spray", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45 }, 0.35);

        // Beat 2: the glass fills.
        tl.fromTo(".fizz-liquid", { scaleY: 0.08 }, { scaleY: 0.88, duration: 0.9 }, 0.55);

        // Beat 3: ions orbit (counter-rotate labels so they stay upright).
        tl.fromTo(".hydrate-orbit", { rotate: -40 }, { rotate: 140, duration: 1.4 }, 1.4);
        tl.fromTo(".hydrate-counter", { rotate: 40 }, { rotate: -140, duration: 1.4 }, 1.4);

        // Beat 4: cans rise into frame.
        tl.fromTo(".outgrow-can", { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, 2.25);
        tl.fromTo(
          ".outgrow-sticker",
          { scale: 1.7, opacity: 0, rotate: -25 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.18, stagger: 0.07, ease: "back.out(2.5)" },
          2.7,
        );

        // Big words drift against the track for parallax depth.
        gsap.utils.toArray<HTMLElement>(".ritual-word").forEach((el, i) => {
          tl.fromTo(el, { xPercent: 18 }, { xPercent: -18, duration: 1.6 }, Math.max(0, i - 0.8));
        });
      });

      // Mobile / reduced motion: show end states.
      mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
        gsap.set(".crack-tab", { rotate: -8, scaleY: -0.55 });
        gsap.set(".crack-mouth, .crack-spray", { scale: 1, opacity: 1 });
        gsap.set(".fizz-liquid", { scaleY: 0.88 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const toLineup = () => {
    if (lenis) lenis.scrollTo("#lineup", { duration: 1.3 });
    else document.getElementById("lineup")?.scrollIntoView();
  };

  return (
    <section id="ritual" ref={root} aria-label="How Klyte hits" className="relative md:h-[420vh]">
      <div className="relative md:sticky md:top-0 md:h-[100svh] md:overflow-hidden">
        <div className="ritual-track flex flex-col md:h-full md:w-[400%] md:flex-row">
          {BEATS.map((beat, i) => {
            const Art = ART[beat.key];
            return (
              <article
                key={beat.key}
                className={cn(
                  "relative flex min-h-[90svh] w-full items-center overflow-hidden border-t border-line md:h-full md:min-h-0 md:border-l md:border-t-0",
                  i === 0 && "md:border-l-0",
                )}
              >
                {/* Oversized beat word, drifting for depth */}
                <span
                  aria-hidden
                  className="ritual-word pointer-events-none absolute -bottom-[0.12em] left-0 select-none whitespace-nowrap font-display text-[clamp(7rem,22vw,22rem)] uppercase leading-none text-fg/[0.05]"
                >
                  {beat.word}
                </span>

                <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-8 md:py-0">
                  <div>
                    <p className="hud-label mb-5 tabular">
                      0{i + 1} <span className="opacity-50">/ 04</span>
                    </p>
                    <h3 className="font-display text-display-xl uppercase text-fg">{beat.word}</h3>
                    <p className="mt-6 text-xl font-medium text-fg md:text-2xl">{beat.title}</p>
                    <p className="mt-3 max-w-md text-pretty text-base leading-relaxed text-fg/60">{beat.body}</p>
                    {beat.key === "outgrow" && (
                      <button
                        type="button"
                        onClick={toLineup}
                        className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.97]"
                      >
                        Meet the lineup
                        <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                      </button>
                    )}
                  </div>
                  <div className="relative flex h-[min(56vh,460px)] items-center justify-center">
                    <Art />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Beat progress (desktop) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden md:block">
          <div className="mx-auto max-w-6xl px-8">
            <div className="h-px w-full bg-line">
              <div className="ritual-progress h-px origin-left bg-accent" style={{ transform: "scaleX(0.25)" }} data-accent-fade />
            </div>
            <div className="mt-3 grid grid-cols-4 font-mono text-mono-xs uppercase text-fg/45">
              {BEATS.map((b) => (
                <span key={b.key}>{b.word.replace(".", "")}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
