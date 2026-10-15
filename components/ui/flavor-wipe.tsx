"use client";

import { useEffect, useRef } from "react";
import type { Flavor } from "@/lib/data";

export interface WipeRequest {
  key: number;
  flavor: Flavor;
  x: number;
  y: number;
}

/**
 * Full-screen "pour" between flavors: the new flavor floods out of the
 * button you pressed, its name lands, then the page underneath is revealed
 * already re-coloured. WAAPI on clip-path / transform / opacity only.
 */
export function FlavorWipe({ req, onPeak, onDone }: { req: WipeRequest; onPeak: () => void; onDone: () => void }) {
  const layer = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const peak = useRef(onPeak);
  const done = useRef(onDone);
  peak.current = onPeak;
  done.current = onDone;

  useEffect(() => {
    const el = layer.current;
    const tx = title.current;
    if (!el || !tx) return;
    const at = `${req.x}px ${req.y}px`;
    const r = Math.hypot(Math.max(req.x, innerWidth - req.x), Math.max(req.y, innerHeight - req.y));

    const flood = el.animate(
      [{ clipPath: `circle(0px at ${at})` }, { clipPath: `circle(${r}px at ${at})` }],
      { duration: 620, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "forwards" },
    );
    tx.animate(
      [
        { transform: "translateY(40%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 700, delay: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" },
    );

    let cancelled = false;
    flood.finished
      .then(() => {
        if (cancelled) return;
        peak.current();
        return new Promise((res) => setTimeout(res, 380));
      })
      .then(() => {
        if (cancelled) return;
        const out = el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 450,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          fill: "forwards",
        });
        tx.animate([{ transform: "translateY(0)" }, { transform: "translateY(-30%)" }], {
          duration: 450,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          fill: "forwards",
        });
        return out.finished;
      })
      .then(() => {
        if (!cancelled) done.current();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [req]);

  const f = req.flavor;
  return (
    <div
      ref={layer}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
      style={{
        clipPath: `circle(0px at ${req.x}px ${req.y}px)`,
        background: `radial-gradient(60% 60% at 50% 50%, ${f.glow}, transparent 75%), linear-gradient(160deg, ${f.can.top}, ${f.can.bottom})`,
      }}
    >
      <div ref={title} className="px-6 text-center text-white">
        <p className="font-mono text-mono-xs uppercase opacity-80">{f.profile}</p>
        <p className="mt-3 font-display text-[clamp(4rem,14vw,13rem)] uppercase leading-[0.85]">{f.name}</p>
      </div>
    </div>
  );
}
