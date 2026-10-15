"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Zap } from "lucide-react";
import { useLenis } from "lenis/react";
import { FLAVORS, POSITIONING } from "@/lib/data";
import { useFlavor } from "@/components/providers/flavor-provider";
import { Magnetic } from "@/components/ui/magnetic";
import { useMediaQuery } from "@/lib/use-media-query";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_OUT, cn } from "@/lib/utils";

const CanStage = dynamic(() => import("@/components/three/can-stage"), { ssr: false });

/** Where the can sits on desktop, as a fraction of the hero width. */
const CAN_X = 0.72;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { flavor, pourTo } = useFlavor();
  const lenis = useLenis();
  const desktop = useMediaQuery("(min-width: 768px)");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from(".hero-line > span", { yPercent: 105, duration: 1.1, stagger: 0.09 }, 0.1)
          .from(".hero-fade", { opacity: 0, y: 14, duration: 0.8, stagger: 0.07 }, 0.45);

        gsap.to(".hero-parallax", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.5 },
        });
        gsap.to(".hero-copy", {
          opacity: 0,
          y: -40,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "25% top", end: "75% top", scrub: 0.5 },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const scrollTo = (id: string) => {
    if (lenis) lenis.scrollTo(`#${id}`, { duration: 1.3 });
    else document.getElementById(id)?.scrollIntoView();
  };

  const stage = (
    <div className="hero-parallax pointer-events-none absolute inset-0">
      {FLAVORS.map((f) => (
        <div
          key={f.id}
          aria-hidden
          className="absolute aspect-square w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-[900ms] ease-out-expo md:w-[min(42vw,600px)]"
          style={{
            left: desktop ? `${CAN_X * 100}%` : "50%",
            top: "50%",
            opacity: f.id === flavor.id ? 1 : 0,
            background: `radial-gradient(circle, ${f.glow} 0%, color-mix(in srgb, ${f.glow} 45%, transparent) 36%, transparent 68%)`,
          }}
        />
      ))}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT }}
      >
        <CanStage
          flavorId={flavor.id}
          eventSource={root}
          anchorX={desktop ? CAN_X : 0.5}
          anchorY={desktop ? 0.52 : 0.5}
          scale={desktop ? 0.74 : 1}
          className="h-full w-full"
        />
      </motion.div>
    </div>
  );

  return (
    <section id="top" ref={root} className="relative overflow-hidden">
      {/* Flavor wash: one layer per flavor, crossfaded on opacity only. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {FLAVORS.map((f) => (
          <div
            key={f.id}
            className="absolute inset-0 transition-opacity duration-[900ms] ease-out-expo"
            style={{
              opacity: f.id === flavor.id ? "var(--wash)" : 0,
              background: `radial-gradient(55% 65% at ${desktop ? CAN_X * 100 : 50}% 50%, ${f.glow} 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* Desktop: one full-bleed stage so fruit can roam the whole hero. */}
      {desktop && stage}

      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl grid-cols-1 content-start items-center gap-2 px-5 pb-14 pt-20 md:grid-cols-[1.05fr_1fr] md:content-center md:gap-4 md:px-8 md:pt-24">
        <div className="hero-copy relative z-10 max-w-xl">
          <p className="hero-fade hud-label mb-4 md:mb-6">{POSITIONING.category}</p>

          <h1 className="font-display text-display-xl uppercase text-fg">
            <span className="hero-line block overflow-hidden pb-[0.04em]">
              <span className="block">Hydration,</span>
            </span>
            <span className="hero-line block overflow-hidden pb-[0.04em]">
              <span className="block">
                recharged
                <span className="text-accent" data-accent-fade>
                  .
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-fade mt-4 max-w-md md:mt-6 text-pretty text-base leading-relaxed text-fg/65 md:text-lg">
            Zero caffeine. No added sugar. Five electrolytes and B vitamins that recharge you without borrowing
            from tomorrow.
          </p>

          <div role="radiogroup" aria-label="Choose a flavor" className="hero-fade mt-7 grid md:mt-9 max-w-md grid-cols-2 gap-2">
            {FLAVORS.map((f) => {
              const active = f.id === flavor.id;
              return (
                <button
                  key={f.id}
                  role="radio"
                  aria-checked={active}
                  onClick={(e) => pourTo(f.id, { x: e.clientX, y: e.clientY })}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl border p-2.5 pr-3 text-left backdrop-blur-md transition-[border-color,background-color,transform] duration-200 ease-out active:scale-[0.98]",
                    active ? "border-fg/25 bg-card" : "border-line hover:border-fg/20",
                  )}
                >
                  <span
                    aria-hidden
                    className="h-11 w-6 shrink-0 rounded-[6px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] transition-transform duration-300 ease-out-expo group-hover:-rotate-6"
                    style={{ background: `linear-gradient(180deg, ${f.can.top} 0 45%, ${f.can.bottom})` }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{f.name}</span>
                    <span className="block truncate text-xs text-fg/50">{f.ingredients.slice(0, 2).join(" / ")}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hero-fade mt-4 flex flex-wrap items-center gap-3">
            <Magnetic strength={8}>
              <button
                type="button"
                onClick={() => scrollTo("buy")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent pl-5 pr-6 text-sm font-medium text-on-accent transition-transform duration-150 ease-out active:scale-[0.97]"
                data-accent-fade
              >
                <Zap className="size-4" />
                Get it cold in 10 min
              </button>
            </Magnetic>
            <button
              type="button"
              onClick={() => scrollTo("ritual")}
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm text-fg/70 transition-colors duration-200 hover:text-fg"
            >
              How it hits
              <ArrowDown className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile: the stage leads, so the can is on the first screen. */}
        <div className="relative order-first h-[40svh] md:order-none md:h-[min(84svh,720px)]">
          {!desktop && stage}
          <div className="absolute inset-x-0 bottom-2 flex justify-center md:hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={flavor.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="whitespace-nowrap font-mono text-mono-xs uppercase text-fg/50"
              >
                {flavor.profile}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="h-10 w-px overflow-hidden bg-line">
          <motion.div
            className="h-1/2 w-full bg-fg/60"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
