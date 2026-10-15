"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef } from "react";
import {
  animate,
  useInView,
} from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  delay?: number;
  className?: string;
  suffix?: string;
}

/**
 * Counts between two numbers when scrolled into view. Writes straight to the
 * DOM node, so the count never re-renders React per frame.
 */
export function CountUp({ to, from = 0, duration = 1.6, decimals = 0, delay = 0, className, suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const fmt = (v: number) => `${v.toFixed(decimals)}${suffix}`;
    if (!inView) {
      node.textContent = fmt(reduce ? to : from);
      return;
    }
    if (reduce) {
      node.textContent = fmt(to);
      return;
    }
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => (node.textContent = fmt(v)),
    });
    return () => controls.stop();
  }, [inView, from, to, duration, decimals, delay, suffix, reduce]);

  return (
    <span ref={ref} className={className}>
      {`${from.toFixed(decimals)}${suffix}`}
    </span>
  );
}
