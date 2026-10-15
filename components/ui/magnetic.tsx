"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Max travel in px at the element edge. */
  strength?: number;
}

/**
 * Pulls its child toward the cursor with a spring. Hover-capable pointers
 * only; touch devices get a plain, pressable element.
 */
export function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 16, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 16, mass: 0.6 });
  // Inner content travels a little further for a parallax "lens" feel.
  const ix = useTransform(x, (v) => v * 0.35);
  const iy = useTransform(y, (v) => v * 0.35);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * strength);
    my.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * strength);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={cn("inline-flex", className)}
    >
      <motion.div style={{ x: ix, y: iy }} className="inline-flex">
        {children}
      </motion.div>
    </motion.div>
  );
}
