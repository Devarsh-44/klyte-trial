"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Check, Zap } from "lucide-react";
import { useLenis } from "lenis/react";
import { FLAVORS, POSITIONING } from "@/lib/data";
import { charge } from "@/lib/charge";
import { useFlavor } from "@/components/providers/flavor-provider";
import { usePanel } from "@/components/providers/panel-provider";
import { Magnetic } from "@/components/ui/magnetic";
import { LikePill, NoBadVibes } from "@/components/stickers/stickers";
import { useMediaQuery } from "@/lib/use-media-query";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_OUT, cn } from "@/lib/utils";

const CanStage = dynamic(() => import("@/components/three/can-stage"), { ssr: false });

/** Where the can sits on desktop, as a fraction of the hero width. */
const CAN_X = 0.72;
/** Hold time for a full charge, and how fast an early release drains. */
const FILL_S = 1.4;
const DRAIN_S = 0.25;
const NUDGE = 0.3;
const RING_C = 2 * Math.PI * 25;

type Phase = "idle" | "charging" | "recharged";
type Mode = "idle" | "fill" | "nudge" | "drain";

const BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  left: 4 + ((i * 41) % 92),
  size: 6 + ((i * 7) % 12),
  dur: 3.2 + ((i * 13) % 30) / 10,
  delay: -((i * 17) % 50) / 10,
}));
const BURST = Array.from({ length: 22 }, (_, i) => {
  const a = -Math.PI / 2 + ((i / 21) - 0.5) * 2.4;
  const d = 140 + ((i * 37) % 120);
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, s: 6 + ((i * 5) % 10), delay: (i % 5) * 0.02 };
});

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { flavor, pourTo } = useFlavor();
  const { openPanel } = usePanel();
  const lenis = useLenis();
  const desktop = useMediaQuery("(min-width: 768px)");
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [burstKey, setBurstKey] = useState(0);

  const liquidRef = useRef<HTMLDivElement>(null);
  const levelWrapRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const ringMobileRef = useRef<SVGCircleElement>(null);
  const sim = useRef({ v: 0, mode: "idle" as Mode, holding: false, pressAt: 0, from: 0, nudgeAt: 0, last: 0, raf: 0 });
  const flavorRef = useRef(flavor.id);
  flavorRef.current = flavor.id;

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
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  /* ---------------------------------------------------------- charge ---- */

  // Paint one charge level straight to the DOM: no React render per frame.
  const apply = useCallback((v: number) => {
    charge.value = v;
    const liquid = liquidRef.current;
    if (liquid) {
      liquid.style.transform = `translate3d(0, ${(1 - v) * 100}%, 0)`;
      liquid.style.visibility = v > 0.001 ? "visible" : "hidden";
    }
    // The waterline label rides above the can on its own layer, and steps
    // aside at 100% so it never sits on the nav.
    const wrap = levelWrapRef.current;
    if (wrap) {
      wrap.style.transform = `translate3d(0, ${(1 - v) * 100}%, 0)`;
      wrap.style.visibility = v > 0.001 && v < 0.995 ? "visible" : "hidden";
    }
    if (levelRef.current) levelRef.current.textContent = `${Math.round(v * 100)}% recharged`;
    for (const ring of [ringRef.current, ringMobileRef.current]) {
      if (ring) ring.style.strokeDashoffset = String(RING_C * (1 - v));
    }
    // Copy that sits under the waterline flips to white for contrast.
    const sec = root.current;
    if (sec) {
      const r = sec.getBoundingClientRect();
      const line = r.top + r.height * (1 - v);
      sec.querySelectorAll<HTMLElement>("[data-sink]").forEach((el) => {
        const b = el.getBoundingClientRect();
        el.classList.toggle("sunk", v > 0.001 && b.top + b.height / 2 > line);
      });
    }
  }, []);

  const complete = useCallback(() => {
    const s = sim.current;
    s.v = 1;
    s.mode = "idle";
    s.holding = false;
    apply(1);
    charge.rechargedAt = performance.now();
    setPhase("recharged");
    setBurstKey((k) => k + 1);
    try {
      navigator.vibrate?.(45);
    } catch {
      /* vibration unsupported */
    }
    window.setTimeout(() => openPanel(flavorRef.current), 950);
  }, [apply, openPanel]);

  const tick = useCallback(
    (now: number) => {
      const s = sim.current;
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      if (s.mode === "fill") s.v += dt / FILL_S;
      else if (s.mode === "nudge") {
        const t = (now - s.nudgeAt) / 1000;
        // A plain click: rise to 30%, then drain gently, nudging you to hold.
        s.v = t < 0.35 ? s.from + (NUDGE - s.from) * (1 - Math.pow(1 - t / 0.35, 3)) : Math.max(0, s.v - dt * (NUDGE / 1.6));
      } else if (s.mode === "drain") s.v -= dt * (s.from / DRAIN_S);

      if (s.v >= 1) return complete();
      s.v = Math.max(0, s.v);
      apply(s.v);
      if (s.v <= 0 && !s.holding && (s.mode === "drain" || (s.mode === "nudge" && now - s.nudgeAt > 400))) {
        s.mode = "idle";
        setPhase("idle");
        return;
      }
      s.raf = requestAnimationFrame(tick);
    },
    [apply, complete],
  );

  const press = useCallback(() => {
    const s = sim.current;
    if (phase === "recharged" || s.holding) return;
    if (reduce) return complete();                       // reduced motion: one tap, fully charged
    s.holding = true;
    s.pressAt = performance.now();
    s.mode = "fill";
    setPhase("charging");
    cancelAnimationFrame(s.raf);
    s.last = performance.now();
    s.raf = requestAnimationFrame(tick);
  }, [phase, reduce, complete, tick]);

  const release = useCallback(() => {
    const s = sim.current;
    if (!s.holding) return;
    s.holding = false;
    const held = performance.now() - s.pressAt;
    if (held < 220 && s.v < NUDGE) {
      s.mode = "nudge";
      s.from = s.v;
      s.nudgeAt = performance.now();
    } else {
      s.mode = "drain";
      s.from = Math.max(s.v, 0.01);
    }
  }, []);

  // Space holds too, while the hero is on screen and nothing else has focus.
  useEffect(() => {
    const inHero = () => window.scrollY < (root.current?.offsetHeight ?? 0) * 0.5;
    const free = () => document.activeElement === document.body || document.activeElement === null;
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || !free() || !inHero()) return;
      e.preventDefault();
      press();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [press, release]);

  useEffect(() => () => cancelAnimationFrame(sim.current.raf), []);
  // Keep the waterline contrast right if the layout shifts while charged.
  useEffect(() => {
    if (phase !== "recharged") return;
    const onResize = () => apply(1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase, apply]);

  const holdHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (phase === "recharged") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      press();
    },
    onPointerUp: release,
    onPointerCancel: release,
    onKeyDown: (e: React.KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat && phase !== "recharged") {
        e.preventDefault();
        press();
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") release();
    },
    onClick: () => phase === "recharged" && openPanel(flavor.id),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

  /* ---------------------------------------------------------- pieces ---- */

  const onPickerKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    if (!step) return;
    e.preventDefault();
    const i = FLAVORS.findIndex((f) => f.id === flavor.id);
    const next = FLAVORS[(i + step + FLAVORS.length) % FLAVORS.length];
    const btn = e.currentTarget.querySelector<HTMLButtonElement>(`[data-flavor="${next.id}"]`);
    btn?.focus();
    const r = btn?.getBoundingClientRect();
    pourTo(next.id, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
  };

  const scrollTo = (id: string) => {
    if (lenis) lenis.scrollTo(`#${id}`, { duration: 1.3 });
    else document.getElementById(id)?.scrollIntoView();
  };

  const recharged = phase === "recharged";
  const holdLabel = recharged ? "Recharged" : phase === "charging" ? "Keep holding…" : "Hold to recharge";

  const ring = (size: number, ref: React.RefObject<SVGCircleElement | null>) => (
    <span className="relative grid shrink-0 place-items-center rounded-full bg-black/35 backdrop-blur-md" style={{ width: size, height: size }}>
      <svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
        <circle ref={ref} cx="30" cy="30" r="25" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={RING_C} />
      </svg>
      {recharged ? <Check className="relative size-[38%] text-white" /> : <Zap className="relative size-[38%] fill-[#F5C84B] text-[#F5C84B]" />}
    </span>
  );

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
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT }}>
        <CanStage
          flavorId={flavor.id}
          eventSource={root}
          anchorX={desktop ? CAN_X : 0.5}
          anchorY={desktop ? 0.52 : 0.5}
          scale={desktop ? 0.74 : 1}
          reactive
          className="h-full w-full"
        />
      </motion.div>
    </div>
  );

  // The 100% moment: fizz bursts from the can, two stickers slap on.
  const celebrate = (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
      <div className="absolute" style={{ left: desktop ? `${CAN_X * 100}%` : "50%", top: desktop ? "38%" : "40%" }}>
        {!reduce &&
          BURST.map((p, i) => (
            <span
              key={`${burstKey}-${i}`}
              className="hero-burst absolute rounded-full border-2 border-white/80 bg-white/25"
              style={{ width: p.s, height: p.s, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animationDelay: `${p.delay}s` } as React.CSSProperties}
            />
          ))}
      </div>
      <motion.span
        className="absolute w-24 drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] md:w-28"
        style={{ left: desktop ? `calc(${CAN_X * 100}% + 9vw)` : "68%", top: desktop ? "24%" : "30%" }}
        initial={{ scale: 1.7, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 12, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.45, delay: 0.15 }}
      >
        <NoBadVibes className="w-full" />
      </motion.span>
      <motion.span
        className="absolute w-32 drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] md:w-36"
        style={{ left: desktop ? `calc(${CAN_X * 100}% - 15vw)` : "8%", top: desktop ? "64%" : "58%" }}
        initial={{ scale: 1.7, rotate: 30, opacity: 0 }}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.45, delay: 0.3 }}
      >
        <LikePill className="w-full" />
      </motion.span>
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

      {/* The battery: flavor-coloured liquid that rises with the charge. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div ref={liquidRef} className="absolute inset-0 will-change-transform" style={{ transform: "translate3d(0,100%,0)", visibility: "hidden" }}>
          {FLAVORS.map((f) => (
            <div
              key={f.id}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: f.id === flavor.id ? 1 : 0, background: `linear-gradient(180deg, ${f.can.top} 0%, ${f.can.mid} 55%, ${f.can.bottom} 100%)` }}
            >
              <svg className="hero-wave absolute -top-[22px] left-0 h-6 w-[200%]" viewBox="0 0 1200 24" preserveAspectRatio="none">
                <path d="M0 12 Q 75 0 150 12 T 300 12 T 450 12 T 600 12 T 750 12 T 900 12 T 1050 12 T 1200 12 V 24 H 0 Z" fill={f.can.top} />
              </svg>
            </div>
          ))}
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="hero-bubble absolute bottom-0 rounded-full border border-white/50 bg-white/15"
              style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            />
          ))}
        </div>
      </div>
      <div ref={levelWrapRef} aria-hidden className="pointer-events-none absolute inset-0 z-20" style={{ transform: "translate3d(0,100%,0)", visibility: "hidden" }}>
        <div className="absolute right-5 top-3 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)] md:right-10">
          <span className="h-px w-10 bg-white/80" />
          <span ref={levelRef} className="tabular">0% recharged</span>
        </div>
      </div>

      {/* Desktop: one full-bleed stage so fruit can roam the whole hero. */}
      {desktop && stage}
      {recharged && celebrate}

      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl grid-cols-1 content-start items-center gap-2 px-5 pb-14 pt-24 md:grid-cols-[1.05fr_1fr] md:content-center md:gap-4 md:px-8">
        <div className="hero-copy relative z-10 max-w-xl">
          <p data-sink className="hero-fade hud-label mb-4 md:mb-6">
            {POSITIONING.category}
          </p>

          <h1 className="font-display text-display-xl uppercase text-fg" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {!recharged ? (
                <motion.span key="hydration" className="block" exit={{ y: "-0.4em", opacity: 0 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
                  <span data-sink className="hero-line block overflow-hidden pb-[0.04em]">
                    <span className="block">Hydration,</span>
                  </span>
                  <span data-sink className="hero-line block overflow-hidden pb-[0.04em]">
                    <span className="block">
                      recharged
                      <span className="text-accent" data-accent-fade>
                        .
                      </span>
                    </span>
                  </span>
                </motion.span>
              ) : (
                <motion.span key="recharged" data-sink className="block overflow-hidden pb-[0.04em] text-white">
                  <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }}>
                    Recharged.
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </h1>

          <p data-sink className="hero-fade mt-4 hidden max-w-md text-pretty text-base leading-relaxed text-fg/65 md:mt-6 md:block md:text-lg">
            Zero caffeine. No added sugar. Five electrolytes and B vitamins that recharge you without borrowing from tomorrow.
          </p>

          <div role="radiogroup" aria-label="Choose a flavor" onKeyDown={onPickerKey} className="hero-fade mt-7 hidden max-w-md grid-cols-2 gap-2 md:mt-8 md:grid">
            {FLAVORS.map((f) => {
              const active = f.id === flavor.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  data-flavor={f.id}
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
                    <span className="block text-sm font-medium leading-snug text-fg">{f.name}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-fg/50">{f.ingredients.slice(0, 2).join(" / ")}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop hold button */}
          <button
            type="button"
            {...holdHandlers}
            aria-label={recharged ? "Recharged. Open the buy panel" : "Hold to recharge"}
            className="hero-fade mt-6 hidden select-none items-center gap-4 rounded-full py-1 pr-4 text-left [-webkit-touch-callout:none] [touch-action:none] md:inline-flex"
          >
            {ring(64, ringRef)}
            <span data-sink>
              <span className="block text-base font-semibold text-fg">{holdLabel}</span>
              <span className="block text-xs text-fg/50">{recharged ? "Pick your pack" : "Keep holding, or press Space"}</span>
            </span>
          </button>

          <div className="hero-fade mt-5 hidden flex-wrap items-center gap-3 md:flex">
            <Magnetic strength={8}>
              <button
                type="button"
                onClick={() => scrollTo("buy")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-fg pl-5 pr-6 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                Get it cold in 10 min
              </button>
            </Magnetic>
            <button
              type="button"
              onClick={() => scrollTo("ritual")}
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm text-fg/70 transition-colors duration-200 hover:text-fg"
              data-sink
            >
              How it hits
              <ArrowDown className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile: the stage under the headline, with a thumb-sized hold button. */}
        <div className="relative h-[60svh] md:h-[min(84svh,720px)]">
          {!desktop && stage}
          <div className="absolute inset-x-0 bottom-2 flex flex-col items-center gap-2 md:hidden">
            <button
              type="button"
              {...holdHandlers}
              aria-label={recharged ? "Recharged. Open the buy panel" : "Hold to recharge"}
              className="select-none rounded-full [-webkit-touch-callout:none] [touch-action:none]"
            >
              {ring(88, ringMobileRef)}
            </button>
            <span data-sink className="text-sm font-semibold text-fg">
              {holdLabel}
            </span>
          </div>
        </div>

        {/* Mobile: the rest of the copy sits under the stage. */}
        <div className="md:hidden">
          <p data-sink className="max-w-md text-pretty text-base leading-relaxed text-fg/65">
            Zero caffeine. No added sugar. Five electrolytes and B vitamins that recharge you without borrowing from tomorrow.
          </p>
          <button
            type="button"
            onClick={() => scrollTo("buy")}
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-bg active:scale-[0.97]"
          >
            Get it cold in 10 min
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="h-10 w-px overflow-hidden bg-line">
          <motion.div className="h-1/2 w-full bg-fg/60" animate={{ y: ["-100%", "200%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </div>
      </div>
    </section>
  );
}
