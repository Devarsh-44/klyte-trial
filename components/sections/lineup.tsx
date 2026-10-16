"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useLenis } from "lenis/react";
import { FLAVORS, PRICE } from "@/lib/data";
import { useFlavor } from "@/components/providers/flavor-provider";
import { usePanel } from "@/components/providers/panel-provider";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE_OUT, cn } from "@/lib/utils";

const CanStage = dynamic(() => import("@/components/three/can-stage"), { ssr: false });

export function Lineup() {
  const wrap = useRef<HTMLElement>(null);
  const { flavor, flavorIndex, setFlavor, pourTo } = useFlavor();
  const { openPanel } = usePanel();
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const pinned = desktop && !reduce;
  const lenis = useLenis();

  const progressRaw = useMotionValue(0);
  const progress = useSpring(progressRaw, { stiffness: 140, damping: 26 });
  const current = useRef(flavorIndex);
  current.current = flavorIndex;

  // Scroll position inside the runway picks the flavor.
  useGSAP(
    () => {
      if (!pinned || !wrap.current) return;
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progressRaw.set(self.progress);
          const idx = Math.min(FLAVORS.length - 1, Math.floor(self.progress * FLAVORS.length));
          if (idx !== current.current) setFlavor(FLAVORS[idx].id);
        },
      });
      return () => st.kill();
    },
    { dependencies: [pinned], scope: wrap },
  );

  useEffect(() => {
    if (!pinned) progressRaw.set((flavorIndex + 1) / FLAVORS.length);
  }, [pinned, flavorIndex, progressRaw]);

  const goTo = (i: number) => {
    const target = (i + FLAVORS.length) % FLAVORS.length;
    if (!pinned || !wrap.current) return pourTo(FLAVORS[target].id);
    const el = wrap.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const runway = el.offsetHeight - window.innerHeight;
    const y = top + (runway * (target + 0.5)) / FLAVORS.length;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y });
  };

  return (
    <section
      id="lineup"
      ref={wrap}
      aria-labelledby="lineup-title"
      className={cn("relative", pinned ? "h-[260vh]" : "py-section")}
    >
      <div className={cn("relative overflow-hidden", pinned && "sticky top-0 h-[100svh]")}>
        {/* Scene wash per flavor (pink melon set / blue blueberry set from the films). */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {FLAVORS.map((f) => (
            <div
              key={f.id}
              className="absolute inset-0 transition-opacity duration-700 ease-out-expo"
              style={{
                opacity: f.id === flavor.id ? "var(--wash)" : 0,
                background: `radial-gradient(45% 60% at 50% 50%, ${f.glow}, transparent 75%), linear-gradient(180deg, transparent 40%, ${f.soft}33)`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto flex h-full max-w-6xl flex-col px-5 pb-8 pt-24 md:px-8">
          <div className="flex items-baseline justify-between">
            <h2 id="lineup-title" className="hud-label">
              The lineup
            </h2>
            <p className="hud-label tabular">
              {flavor.index} <span className="opacity-50">/ 0{FLAVORS.length}</span>
            </p>
          </div>

          <div className="grid flex-1 grid-cols-1 items-center gap-8 py-6 md:grid-cols-[1fr_1.1fr_0.8fr]">
            {/* Name + description */}
            <div className="relative z-10 order-2 md:order-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={flavor.id}
                  initial={{ opacity: 0, filter: "blur(6px)", y: 12 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(6px)", y: -10 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <p className="text-sm text-tint" data-accent-fade>
                    {flavor.tagline}
                  </p>
                  <h3 className="mt-3 font-display text-display-lg uppercase text-fg">
                    {flavor.name.split(" ").map((w) => (
                      <span key={w} className="block">
                        {w}
                      </span>
                    ))}
                  </h3>
                  <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg/65">{flavor.description}</p>
                  <button
                    type="button"
                    onClick={() => openPanel(flavor.id)}
                    className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-accent pl-4 pr-5 text-sm font-medium text-on-accent transition-transform duration-150 ease-out active:scale-[0.97]"
                    data-accent-fade
                  >
                    <Plus className="size-4" /> Get {flavor.name}
                    <span className="text-on-accent/70 tabular">
                      from {PRICE.currency}
                      {PRICE.can}
                    </span>
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Can */}
            <div className="relative order-1 h-[52svh] md:order-2 md:h-[72svh]">
              <CanStage flavorId={flavor.id} className="h-full w-full" />
            </div>

            {/* Tasting notes */}
            <div className="relative z-10 order-3">
              <p className="hud-label mb-3">Tasting notes</p>
              <dl className="border-t border-line">
                {flavor.notes.map((n) => (
                  <div key={n.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3.5">
                    <dt className="text-xs text-fg/45">{n.label}</dt>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.dd
                        key={flavor.id + n.label}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                        className="text-right text-sm text-fg"
                      >
                        {n.value}
                      </motion.dd>
                    </AnimatePresence>
                  </div>
                ))}
              </dl>
              <p className="hud-label mb-3 mt-8">Made with</p>
              <ul className="flex flex-wrap gap-2">
                {flavor.ingredients.map((ing) => (
                  <li key={ing} className="rounded-full border border-line px-3 py-1.5 text-xs text-fg/75">
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rail */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(flavorIndex - 1)}
              aria-label="Previous flavor"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-fg/80 transition-[color,transform] duration-150 ease-out hover:text-fg active:scale-[0.95]"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex flex-1 gap-2">
              {FLAVORS.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${f.name}`}
                  aria-current={i === flavorIndex}
                  className="group flex-1 py-3 text-left"
                >
                  <span
                    className={cn(
                      "mb-2 block text-xs transition-colors duration-200",
                      i === flavorIndex ? "text-fg" : "text-fg/40 group-hover:text-fg/70",
                    )}
                  >
                    {f.name}
                  </span>
                  <span className="relative block h-px overflow-hidden bg-line">
                    <SegmentFill progress={progress} index={i} />
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(flavorIndex + 1)}
              aria-label="Next flavor"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-fg/80 transition-[color,transform] duration-150 ease-out hover:text-fg active:scale-[0.95]"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SegmentFill({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const n = FLAVORS.length;
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const paint = (v: number) => {
      const local = Math.min(1, Math.max(0, v * n - index));
      if (ref.current) ref.current.style.transform = `scaleX(${local})`;
    };
    paint(progress.get());
    return progress.on("change", paint);
  }, [progress, index, n]);
  return (
    <span
      ref={ref}
      className="absolute inset-0 origin-left bg-accent"
      style={{ transform: "scaleX(0)" }}
      data-accent-fade
    />
  );
}
