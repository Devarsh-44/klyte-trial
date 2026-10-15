"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { CREATORS, MARQUEE_WORDS } from "@/lib/data";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * Infinite row whose speed and direction follow scroll velocity.
 * Content is rendered twice; x wraps across exactly one copy (-50%..0).
 */
function VelocityRow({
  children,
  baseVelocity = 2,
  className,
}: {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 3], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    let move = dir.current * baseVelocity * (delta / 1000);
    move += move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  return (
    <div ref={ref} className={cn("mask-fade-x overflow-hidden", className)}>
      <motion.div style={{ x }} className="flex w-max">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function initials(handle: string) {
  return handle
    .replace("@", "")
    .split(/[._]/)
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export function Marquee() {
  return (
    <section aria-label="What people are saying" className="relative space-y-8 py-section">
      <VelocityRow baseVelocity={-1.6}>
        {MARQUEE_WORDS.map((w) => (
          <span key={w} className="flex items-center">
            <span className="px-8 font-display text-display-md uppercase text-fg/85 md:px-12">{w}</span>
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" data-accent-fade />
          </span>
        ))}
      </VelocityRow>

      <VelocityRow baseVelocity={1.1}>
        {CREATORS.map((c) => (
          <figure key={c.handle} className="glass mx-1.5 flex w-[20rem] shrink-0 items-center gap-4 rounded-2xl p-4 pr-6">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-fg/70"
            >
              {initials(c.handle)}
            </span>
            <div className="min-w-0">
              <blockquote className="truncate text-sm text-fg">&ldquo;{c.quote}&rdquo;</blockquote>
              <figcaption className="mt-1 truncate text-xs text-fg/45">
                {c.handle} / {c.tag}
              </figcaption>
            </div>
          </figure>
        ))}
      </VelocityRow>
    </section>
  );
}
