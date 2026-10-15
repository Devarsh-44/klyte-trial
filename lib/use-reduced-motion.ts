"use client";

import { useEffect, useState } from "react";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Hydration-safe reduced-motion flag. Server and first client render both
 * return false; the real preference applies right after mount, so markup
 * never mismatches.
 */
export function useReducedMotion() {
  const pref = useFramerReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!pref : false;
}
