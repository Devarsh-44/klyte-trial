"use client";

import { useRef } from "react";
import { MANIFESTO } from "@/lib/data";
import { gsap, useGSAP } from "@/lib/gsap";

const HIGHLIGHT = new Set(["zero", "caffeine,", "added", "sugar,", "crash", "outgrew", "ordinary."]);

/** Scroll-scrubbed manifesto: each word brightens from 12% to full as you read. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const words = MANIFESTO.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".mf-word",
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: { trigger: ".mf-text", start: "top 78%", end: "bottom 45%", scrub: true },
          },
        );
        gsap.fromTo(
          ".mf-rule",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 30%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Manifesto" className="relative px-5 pb-8 pt-section md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center gap-4">
          <span className="hud-label whitespace-nowrap">Why Klyte</span>
          <span className="mf-rule h-px flex-1 origin-left bg-gradient-to-r from-accent to-transparent" data-accent-fade />
        </div>
        <p className="mf-text text-balance text-[clamp(1.75rem,4.2vw,3.75rem)] font-medium leading-[1.08] tracking-[-0.025em] text-fg">
          {words.map((w, i) => (
            <span
              key={i}
              className={`mf-word inline-block pr-[0.25em] ${
                HIGHLIGHT.has(w.toLowerCase()) ? "text-tint" : ""
              }`}
              data-accent-fade={HIGHLIGHT.has(w.toLowerCase()) ? "" : undefined}
            >
              {w}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
