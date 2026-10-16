"use client";

import { useEffect, useRef, useState } from "react";
import { FLAVOR_BY_ID } from "@/lib/data";
import { POUR_KEY as KEY } from "@/lib/init-scripts";

const FILL_MS = 1000;
const DRAIN_MS = 380;

const BUBBLES = Array.from({ length: 10 }, (_, i) => ({ left: 8 + ((i * 37) % 84), size: 5 + ((i * 7) % 8), delay: (i * 0.09) % 0.8 }));

/**
 * First-visit loader. The outlined wordmark fills with Melon from the bottom,
 * bubbles rise through the letters, then the whole screen drains down to
 * reveal the hero. No numbers; never longer than ~1.4 s.
 */
export function PourLoader() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const melon = FLAVOR_BY_ID["melon-mode"];

  useEffect(() => {
    if (document.documentElement.dataset.poured) {
      setDone(true);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const ease = (k: number) => 1 - Math.pow(1 - k, 3);
    const frame = (now: number) => {
      const t = now - start;
      const f = ease(Math.min(1, t / FILL_MS));
      if (fill.current) fill.current.style.clipPath = `inset(${(1 - f) * 100}% 0 0 0)`;
      const d = Math.max(0, Math.min(1, (t - FILL_MS) / DRAIN_MS));
      // Drain: the screen's top edge falls away, revealing the page from the top.
      if (root.current) root.current.style.clipPath = `inset(${ease(d) * 100}% 0 0 0)`;
      if (d < 1) raf = requestAnimationFrame(frame);
      else {
        try {
          localStorage.setItem(KEY, "1");
        } catch {
          /* storage blocked: the pour simply plays again next visit */
        }
        setDone(true);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (done) return null;

  const word = "klyte";
  return (
    <div ref={root} className="pour-loader fixed inset-0 z-[90] grid place-items-center bg-[#0B0B0C]" aria-hidden>
      <div className="relative flex flex-col items-center">
        <div className="relative font-wordmark text-[clamp(5rem,22vw,13rem)] lowercase leading-none">
          {/* outline */}
          <span className="block text-transparent [-webkit-text-stroke:2px_rgba(244,241,234,0.4)]">{word}</span>
          {/* liquid fill, clipped from the bottom up */}
          <div ref={fill} className="absolute inset-0" style={{ clipPath: "inset(100% 0 0 0)" }}>
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(180deg, ${melon.can.top} 0%, ${melon.can.mid} 55%, ${melon.can.bottom} 100%)` }}
            >
              {word}
            </span>
            {BUBBLES.map((b, i) => (
              <span
                key={i}
                className="pour-bubble absolute bottom-[8%] rounded-full border border-white/60"
                style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s` }}
              />
            ))}
          </div>
        </div>
        <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#F4F1EA]/45">Pouring…</p>
      </div>
    </div>
  );
}
