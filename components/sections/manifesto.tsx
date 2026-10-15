"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LikePill, NoBadVibes } from "@/components/stickers/stickers";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------ *
 * Why Klyte: a pinned collage. The opener scrolls away while the brand's
 * stills fly up at different speeds and settle into a tilted stack, the
 * manifesto line rises over them, two stickers slap on, and an off-white
 * curtain slides up with the rest of the story. Mobile and reduced motion
 * get the same pieces as a plain stack.
 * ------------------------------------------------------------------------ */

const PHOTOS = [
  { src: "/media/fruit-sculptures.webp", alt: "Sticker-covered watermelon and blueberry sculptures", x: -24, y: -6, r: -6, w: 21, speed: 1.0 },
  { src: "/media/melon-burst.webp", alt: "Melon Mode can in a burst of watermelon", x: 1, y: -17, r: 4, w: 15, speed: 1.35 },
  { src: "/media/blue-stickers.webp", alt: "Blueberries and stickers exploding", x: 23, y: -5, r: 7, w: 18, speed: 0.85 },
  { src: "/media/melon-ring.webp", alt: "Melon Mode can inside a ring of water", x: -7, y: 15, r: -3, w: 15, speed: 1.2 },
  { src: "/media/blue-can-burst.webp", alt: "Blueberry Spirulina can with a light trail", x: 13, y: 19, r: -8, w: 14, speed: 1.5 },
  { src: "/media/melon-can-fruit.webp", alt: "Melon Mode can on a pile of watermelon", x: -33, y: 21, r: 5, w: 12, speed: 1.1 },
];

const STATEMENT = ["Most cans", "borrow energy", "from tomorrow."];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        // Opener drifts up and out of frame.
        tl.fromTo(".mc-open", { y: 0 }, { y: () => -window.innerHeight * 0.62, duration: 0.34 }, 0);
        // Photos fly up from below, each at its own speed, and settle tilted.
        gsap.utils.toArray<HTMLElement>(".mc-photo").forEach((el, i) => {
          const p = PHOTOS[i];
          tl.fromTo(
            el,
            { y: () => window.innerHeight * (0.9 + 0.35 * p.speed), rotate: p.r * 3 },
            { y: 0, rotate: p.r, duration: 0.42 / p.speed, ease: "power3.out" },
            0.04 + i * 0.035,
          );
          // Then keep drifting at different rates for depth while the line holds.
          tl.to(el, { y: () => -window.innerHeight * 0.06 * p.speed, duration: 0.3 }, 0.55);
        });
        // The statement rises line by line out of its own mask.
        tl.fromTo(".mc-line > span", { yPercent: 110 }, { yPercent: 0, duration: 0.14, stagger: 0.04, ease: "power3.out" }, 0.42);
        // Two stickers slap on as the line lands (overshoot in scale and rotation).
        tl.fromTo(
          ".mc-sticker",
          { scale: 1.7, rotate: -25, autoAlpha: 0 },
          { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.05, stagger: 0.03, ease: "back.out(2.6)" },
          0.6,
        );
        // Curtain: the off-white panel slides up over the stage.
        tl.fromTo(".mc-curtain", { yPercent: 100 }, { yPercent: 0, duration: 0.22, ease: "power2.inOut" }, 0.76);
        tl.fromTo(".mc-curtain-in", { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.12 }, 0.88);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="why" aria-label="Why Klyte" className="relative motion-safe:md:h-[240vh]">
      <div className="relative overflow-hidden bg-[#0B0B0C] text-[#F4F1EA] motion-safe:md:sticky motion-safe:md:top-0 motion-safe:md:h-[100svh]">
        {/* Opener */}
        <div className="mc-open relative z-10 flex flex-col items-center px-5 pt-section text-center motion-safe:md:absolute motion-safe:md:inset-x-0 motion-safe:md:top-[36%] motion-safe:md:pt-0">
          <p className="hud-label mb-5 !text-[#F4F1EA]/55">Why Klyte</p>
          <h2 className="font-display text-display-xl uppercase">Not another energy drink</h2>
        </div>

        {/* Collage */}
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-14 md:grid-cols-3 motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:block motion-safe:md:max-w-none motion-safe:md:p-0">
          {PHOTOS.map((p, i) => (
            // Outer slot holds the resting position; the inner card is what animates.
            <div
              key={p.src}
              className="mc-slot relative motion-safe:md:absolute motion-safe:md:left-1/2 motion-safe:md:top-1/2"
              style={{ "--w": `${p.w}vw`, "--x": `${p.x}vw`, "--y": `${p.y}vh` } as React.CSSProperties}
            >
              <figure
                className={cn(
                  "mc-photo overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
                  i % 2 ? "rotate-2" : "-rotate-2",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
              </figure>
            </div>
          ))}
        </div>

        {/* Statement */}
        <div className="relative z-20 px-5 pb-section text-center motion-safe:md:absolute motion-safe:md:inset-x-0 motion-safe:md:top-1/2 motion-safe:md:-translate-y-1/2 motion-safe:md:pb-0">
          <p className="font-display text-[clamp(3rem,8.4vw,8.5rem)] uppercase leading-[0.9] [text-shadow:0_6px_40px_rgba(0,0,0,0.45)]">
            {STATEMENT.map((line) => (
              <span key={line} className="mc-line block overflow-hidden pb-[0.04em]">
                <span className="block">{line}</span>
              </span>
            ))}
          </p>
          <span className="mc-sticker pointer-events-none absolute right-[14%] top-[-18%] hidden w-28 drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)] motion-safe:md:block">
            <NoBadVibes className="w-full" />
          </span>
          <span className="mc-sticker pointer-events-none absolute bottom-[-14%] left-[16%] hidden w-36 drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)] motion-safe:md:block">
            <LikePill className="w-full" />
          </span>
        </div>

        {/* Curtain */}
        <div className="mc-curtain relative z-30 bg-[#F4F1EA] px-5 py-section text-[#141414] motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:flex motion-safe:md:items-center motion-safe:md:py-0">
          <div className="mc-curtain-in mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr] md:items-end md:px-8">
            <div>
              <p className="hud-label mb-5 !text-[#141414]/55">The Klyte way</p>
              <h3 className="font-display text-display-lg uppercase">
                Klyte runs on
                <br />
                <span className="text-[#D92F43]">what you run on.</span>
              </h3>
            </div>
            <p className="max-w-md text-pretty text-lg leading-relaxed text-[#141414]/70">
              Electrolytes, vitamins and fibre. Zero caffeine, zero added sugar, and no crash waiting at four
              o&apos;clock. Sparkling hydration for people who outgrew the ordinary.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .mc-slot { width: var(--w); transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))); }
        }
      `}</style>
    </section>
  );
}
