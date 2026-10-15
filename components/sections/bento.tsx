"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { EDGE_STATS } from "@/lib/data";
import { CountUp } from "@/components/ui/count-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE_OUT, cn } from "@/lib/utils";

/* One pointer listener on the grid writes --mx/--my onto each card
   (card-local custom props, so only that card's small subtree restyles). */
function useProximityGlow() {
  const gridRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const last = useRef({ x: 0, y: 0 });

  const paint = useCallback(() => {
    frame.current = 0;
    gridRef.current?.querySelectorAll<HTMLElement>(".proximity-card").forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${last.current.x - r.left}px`);
      card.style.setProperty("--my", `${last.current.y - r.top}px`);
    });
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last.current = { x: e.clientX, y: e.clientY };
      if (!frame.current) frame.current = requestAnimationFrame(paint);
    },
    [paint],
  );

  const onPointerLeave = useCallback(() => {
    gridRef.current?.querySelectorAll<HTMLElement>(".proximity-card").forEach((card) => {
      card.style.setProperty("--mx", "-999px");
      card.style.setProperty("--my", "-999px");
    });
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return { gridRef, onPointerMove, onPointerLeave };
}

function Card({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      className={cn("proximity-card glass rounded-4xl p-6 md:p-8", className)}
    >
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </motion.article>
  );
}

/** Energy over six hours: legacy spikes and crashes, Klyte stays level. */
function CurveCard() {
  const reduce = useReducedMotion();
  const legacy = "M0 150 C 30 150, 45 26, 80 24 S 130 70, 160 146 S 230 160, 280 152 S 330 148, 360 148";
  const klyte = "M0 150 C 40 150, 60 96, 110 92 S 240 88, 290 92 S 340 98, 360 100";

  return (
    <Card className="sm:col-span-2 lg:row-span-2">
      <p className="hud-label">Energy over 6 hours</p>
      <h3 className="mt-4 max-w-sm font-display text-display-md uppercase text-fg">Steady, not spiked.</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg/60">
        Caffeine lends you energy and takes it back with interest. Klyte hydrates instead, so the lift is gentle
        and it stays.
      </p>

      <div className="mt-auto pt-10">
        <svg
          viewBox="0 0 360 180"
          className="w-full overflow-visible"
          role="img"
          aria-label="Typical energy drink spikes then crashes; Klyte rises gently and stays level"
        >
          {[50, 100, 150].map((y) => (
            <line key={y} x1="0" x2="360" y1={y} y2={y} stroke="var(--line)" />
          ))}
          <motion.path
            d={legacy}
            fill="none"
            stroke="currentColor"
            className="text-fg/30"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            initial={{ pathLength: reduce ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE_OUT }}
          />
          <motion.path
            d={klyte}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, delay: 0.25, ease: EASE_OUT }}
          />
        </svg>
        <div className="mt-4 flex items-center gap-5 text-xs text-fg/55">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-5 rounded-full bg-accent" data-accent-fade /> Klyte
          </span>
          <span className="flex items-center gap-2">
            <span className="w-5 border-t border-dashed border-fg/40" /> Typical energy drink
          </span>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ stat, delay }: { stat: (typeof EDGE_STATS)[number]; delay: number }) {
  return (
    <Card delay={delay}>
      <p className="hud-label">{stat.label}</p>
      <p className="mt-auto pt-10 font-display text-[clamp(3.25rem,5vw,4.5rem)] leading-none text-fg tabular">
        <CountUp from={stat.from} to={stat.value} duration={1.6} delay={delay} />
        {stat.unit && <span className="ml-1 text-[0.45em] text-fg/45">{stat.unit}</span>}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-fg/60">{stat.body}</p>
    </Card>
  );
}

export function Bento() {
  const { gridRef, onPointerMove, onPointerLeave } = useProximityGlow();
  return (
    <section id="edge" aria-labelledby="edge-title" className="relative px-5 py-section md:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="edge-title"
          kicker="The bio-engineered edge"
          title={
            <>
              Built different,
              <br />
              <span className="text-fg/35">down to the ion.</span>
            </>
          }
          aside="Every number on the can earns its place. Here is what goes in, and what we refused to put in."
          className="mb-12 md:mb-16"
        />
        {/* lg: 4 cols x 2 rows. Curve card = 2x2, four stats = 1x1 each. Gapless. */}
        <div
          ref={gridRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="grid grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[minmax(15rem,auto)] lg:grid-cols-4"
        >
          <CurveCard />
          {EDGE_STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} delay={0.05 * (i + 1)} />
          ))}
        </div>
      </div>
    </section>
  );
}
