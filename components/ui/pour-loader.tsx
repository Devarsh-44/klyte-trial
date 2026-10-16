"use client";

import { useEffect, useRef, useState } from "react";
import { FLAVOR_BY_ID } from "@/lib/data";
import { POUR_KEY } from "@/lib/init-scripts";

const melon = FLAVOR_BY_ID["melon-mode"];

/*
 * Inlined with the markup so the loader paints with the HTML itself, before
 * the stylesheet or any script arrives. Every motion is a transform keyframe,
 * so it runs on the compositor and stays smooth while the main thread is busy
 * starting the 3D scene. The fill is a window sliding up (outer +100% -> 0)
 * over text counter-moving down (-100% -> 0), so the letters stay put.
 */
const CSS = `
@font-face{font-family:"Klyte Loader";src:url(/fonts/titan-one-latin-400-normal.woff2) format("woff2");font-display:block}
.pour-loader{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:#0B0B0C;will-change:transform;
  animation:pour-drain .42s cubic-bezier(.65,0,.35,1) 1.02s forwards}
.pour-word{position:relative;font-family:"Klyte Loader",sans-serif;font-size:clamp(5rem,22vw,13rem);line-height:1;text-transform:lowercase}
.pour-outline{display:block;color:transparent;-webkit-text-stroke:2px rgba(244,241,234,.4)}
.pour-fill{position:absolute;inset:0;overflow:hidden;transform:translate3d(0,100%,0);animation:pour-up .95s cubic-bezier(.22,1,.36,1) .06s forwards}
.pour-fill-in{position:absolute;inset:0;transform:translate3d(0,-100%,0);animation:pour-down .95s cubic-bezier(.22,1,.36,1) .06s forwards}
.pour-fill-in>span{display:block;color:transparent;-webkit-background-clip:text;background-clip:text;
  background-image:linear-gradient(180deg,${melon.can.top} 0%,${melon.can.mid} 55%,${melon.can.bottom} 100%)}
.pour-bubble{position:absolute;bottom:10%;border-radius:50%;border:1px solid rgba(255,255,255,.65);animation:pour-bubble .9s ease-out infinite}
.pour-label{margin-top:1.5rem;font:500 .7rem/1 ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:rgba(244,241,234,.45)}
@keyframes pour-up{to{transform:translate3d(0,0,0)}}
@keyframes pour-down{to{transform:translate3d(0,0,0)}}
@keyframes pour-drain{to{transform:translate3d(0,100%,0)}}
@keyframes pour-bubble{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:1}100%{transform:translate3d(4px,-.9em,0);opacity:0}}
html[data-poured] .pour-loader{display:none}
@media (prefers-reduced-motion:reduce){.pour-loader{display:none}}
`;

const BUBBLES = Array.from({ length: 10 }, (_, i) => ({ left: 8 + ((i * 37) % 84), size: 5 + ((i * 7) % 8), delay: (i * 0.09) % 0.8 }));

/**
 * First-visit loader. The outlined wordmark fills with Melon from the bottom,
 * bubbles rise through the letters, then the screen drains down to reveal the
 * hero. No numbers; ~1.45 s from first paint. Returning visitors skip it (the
 * head script marks <html data-poured> before paint).
 */
export function PourLoader() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.dataset.poured) {
      setGone(true);
      return;
    }
    const finish = () => {
      try {
        localStorage.setItem(POUR_KEY, "1");
      } catch {
        /* storage blocked: the pour simply plays again next visit */
      }
      setGone(true);
    };
    const el = root.current;
    const onEnd = (e: AnimationEvent) => e.animationName === "pour-drain" && finish();
    el?.addEventListener("animationend", onEnd);
    // If hydration lands after the CSS already finished, clean up anyway.
    const t = window.setTimeout(finish, 1800);
    return () => {
      el?.removeEventListener("animationend", onEnd);
      window.clearTimeout(t);
    };
  }, []);

  if (gone) return null;

  const word = "klyte";
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={root} className="pour-loader" aria-hidden>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="pour-word">
            <span className="pour-outline">{word}</span>
            <div className="pour-fill">
              <div className="pour-fill-in">
                <span>{word}</span>
                {BUBBLES.map((b, i) => (
                  <span
                    key={i}
                    className="pour-bubble"
                    style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="pour-label">Pouring…</p>
        </div>
      </div>
    </>
  );
}
