"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------ *
 * "How it hits", told with the brand's own footage.
 * Desktop pins a frame: "Crack [clip] the ordinary." The clip grows out of
 * the gap between the words into a tall frame, pushing them outward, then
 * each scroll step wipes the frame to the next shot (Crack, Fizz, Hydrate,
 * Outgrow) while the words beside it swap through their own masks.
 * Mobile and reduced motion get the four shots as a plain stack.
 * ------------------------------------------------------------------------ */

const STEPS = [
  { key: "crack", word: "Crack", clip: "/media/crack", title: "The good kind of tssk.", body: "Ice cold, pull the tab, and the afternoon resets. That first hiss is the whole point." },
  { key: "fizz", word: "Fizz", clip: "/media/fizz", title: "Fine bubbles, loud flavor.", body: "Tight carbonation carries real fruit up front, so it tastes bright without a single gram of added sugar." },
  { key: "hydrate", word: "Hydrate", clip: "/media/hydrate", title: "Five ions. Zero crash.", body: "Sodium, potassium, magnesium, calcium and chloride, with B6, B12 and C. Energy you do not have to pay back." },
  { key: "outgrow", word: "Outgrow", clip: "/media/outgrow", title: "Then get on with it.", body: "Two flavors, one rule: nothing ordinary goes in the can." },
] as const;

function Clip({ src, className }: { src: string; className?: string }) {
  return (
    <video
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      src={`${src}.mp4`}
      poster={`${src}.webp`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}

export function Ritual() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const frameH = () => window.innerHeight * 0.74;
        const frameW = () => frameH() * (9 / 16);
        gsap.set([".ff-word-1", ".ff-word-2", ".ff-word-3", ".ff-copy-0", ".ff-copy-1", ".ff-copy-2", ".ff-copy-3"], { yPercent: 110 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
        });

        // 1. The inline clip grows from word-sized into the tall frame. The
        //    words sit in a flex row, so they are pushed outward as it grows.
        tl.fromTo(
          ".ff-media",
          { width: "1.55em", height: "0.82em", borderRadius: "0.18em" },
          { width: frameW, height: frameH, borderRadius: "28px", duration: 1, ease: "power2.inOut" },
          0,
        );

        // 2. "the ordinary." gives way to the first step's copy.
        tl.to(".ff-ordinary", { yPercent: -110, duration: 0.25 }, 1.05);
        tl.fromTo(".ff-copy-0", { yPercent: 110 }, { yPercent: 0, duration: 0.3 }, 1.15);

        // 3. Steps 2-4: the frame wipes up to the next clip; words swap.
        for (let i = 1; i < STEPS.length; i++) {
          const at = 1.2 + i * 1.1;
          tl.fromTo(`.ff-clip-${i}`, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power2.inOut" }, at);
          tl.to(`.ff-word-${i - 1}`, { yPercent: -110, duration: 0.3 }, at + 0.05);
          tl.fromTo(`.ff-word-${i}`, { yPercent: 110 }, { yPercent: 0, duration: 0.3 }, at + 0.15);
          tl.to(`.ff-copy-${i - 1}`, { yPercent: -110, duration: 0.3 }, at + 0.05);
          tl.fromTo(`.ff-copy-${i}`, { yPercent: 110 }, { yPercent: 0, duration: 0.3 }, at + 0.2);
          tl.fromTo(`.ff-tick-${i}`, { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, at);
        }
        tl.fromTo(".ff-tick-0", { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 1.05);
        tl.to({}, { duration: 0.6 }); // hold on the last shot before releasing the pin
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
    <section id="ritual" ref={root} aria-labelledby="ritual-title" className="relative motion-safe:md:h-[380vh]">
      {/* Desktop: pinned sentence + frame */}
      <div className="sticky top-0 hidden h-[100svh] flex-col items-center justify-center overflow-hidden motion-safe:md:flex">
        <h2 id="ritual-title" className="sr-only">
          How it hits: crack, fizz, hydrate, outgrow
        </h2>
        <div aria-hidden className="ff-sentence flex w-full items-center justify-center gap-[0.28em] px-8 font-display uppercase leading-[0.9] text-fg" style={{ fontSize: "clamp(2.75rem, 5.6vw, 6rem)" }}>
          {/* Left: the step word */}
          <div className="relative flex flex-1 justify-end overflow-hidden pb-[0.06em]">
            {STEPS.map((s, i) => (
              <span key={s.key} className={cn(`ff-word-${i} block whitespace-nowrap`, i > 0 && "absolute right-0 top-0")}>
                {s.word}
              </span>
            ))}
          </div>

          {/* The clip that grows */}
          <div className="ff-media relative shrink-0 overflow-hidden bg-black shadow-[0_30px_80px_rgba(0,0,0,0.35)]" style={{ width: "1.55em", height: "0.82em", borderRadius: "0.18em" }}>
            {STEPS.map((s, i) => (
              <Clip key={s.key} src={s.clip} className={`ff-clip-${i}`} />
            ))}
          </div>

          {/* Right: "the ordinary." then each step's copy */}
          <div className="relative flex-1 self-stretch">
            {/* Each mask hugs its own content, so a swap hides fully. */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden pb-[0.06em]">
              <span className="ff-ordinary block whitespace-nowrap">the ordinary.</span>
            </div>
            {STEPS.map((s, i) => (
              <div key={s.key} className="absolute left-0 top-1/2 w-full max-w-sm -translate-y-1/2 overflow-hidden font-sans normal-case">
                <div className={`ff-copy-${i}`}>
                  <p className="hud-label mb-3 tabular">
                    0{i + 1} <span className="opacity-50">/ 04</span>
                  </p>
                  <p className="text-[clamp(1.25rem,1.9vw,1.75rem)] font-medium leading-tight tracking-[-0.01em] text-fg">{s.title}</p>
                  <p className="mt-3 text-pretty text-[clamp(0.9rem,1.05vw,1.05rem)] leading-relaxed text-fg/60">{s.body}</p>
                  {s.key === "outgrow" && (
                    <button
                      type="button"
                      onClick={toLineup}
                      className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.97]"
                    >
                      Meet the lineup
                      <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step progress */}
        <div aria-hidden className="absolute inset-x-0 bottom-8">
          <div className="mx-auto grid max-w-6xl grid-cols-4 gap-3 px-8">
            {STEPS.map((s, i) => (
              <div key={s.key}>
                <div className="h-px w-full bg-line">
                  <div className={`ff-tick-${i} h-px origin-left scale-x-0 bg-accent`} data-accent-fade />
                </div>
                <p className="mt-3 font-mono text-mono-xs uppercase text-fg/45">{s.word}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile + reduced motion: the four shots as a stack */}
      <div className="px-5 py-section motion-safe:md:hidden">
        <p className="hud-label mb-5">How it hits</p>
        <p className="font-display text-display-lg uppercase leading-[0.9] text-fg">Crack the ordinary.</p>
        <ol className="mt-10 space-y-12">
          {STEPS.map((s, i) => (
            <li key={s.key}>
              <div className="relative mx-auto aspect-[9/16] max-h-[70svh] overflow-hidden rounded-3xl bg-black">
                <Clip src={s.clip} />
              </div>
              <p className="hud-label mb-2 mt-5 tabular">
                0{i + 1} <span className="opacity-50">/ 04</span>
              </p>
              <h3 className="font-display text-display-md uppercase text-fg">{s.word}.</h3>
              <p className="mt-2 text-lg font-medium text-fg">{s.title}</p>
              <p className="mt-2 text-pretty leading-relaxed text-fg/60">{s.body}</p>
              {s.key === "outgrow" && (
                <button
                  type="button"
                  onClick={toLineup}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg active:scale-[0.97]"
                >
                  Meet the lineup <ArrowRight className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
