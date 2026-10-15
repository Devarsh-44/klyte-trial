"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Keeps ScrollTrigger in lockstep with Lenis' virtual scroll position. */
function ScrollTriggerBridge() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    // One clock for everything: GSAP's ticker drives Lenis, so scroll-scrubbed
    // timelines and inertial scroll never disagree by a frame.
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduce]);

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, lerp: 0.09, wheelMultiplier: 1, smoothWheel: true }}
    >
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
