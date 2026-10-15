"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlavorWipe, type WipeRequest } from "@/components/ui/flavor-wipe";
import { FLAVORS, FLAVOR_BY_ID, type Flavor, type FlavorId } from "@/lib/data";

interface FlavorContextValue {
  flavor: Flavor;
  flavorIndex: number;
  setFlavor: (id: FlavorId) => void;
  /** Switch with the full-screen pour transition, flooding from a point. */
  pourTo: (id: FlavorId, origin?: { x: number; y: number }) => void;
  next: () => void;
  prev: () => void;
}

const FlavorContext = createContext<FlavorContextValue | null>(null);

export function FlavorProvider({ children }: { children: React.ReactNode }) {
  const [flavorId, setFlavorId] = useState<FlavorId>("melon-mode");
  const flavor = FLAVOR_BY_ID[flavorId];
  const flavorIndex = FLAVORS.findIndex((f) => f.id === flavorId);

  // Write the accent tokens once per switch. Elements tagged
  // [data-accent-fade] transition their own colors; the var itself snaps.
  useEffect(() => {
    const root = document.documentElement;
    const vars: Record<string, string> = {
      "--accent": flavor.hex,
      "--tint-dark": flavor.tintDark,
      "--tint-light": flavor.tintLight,
      "--on-accent": flavor.onAccent,
      "--glow": flavor.glow,
      "--accent-soft": flavor.soft,
      "--accent-deep": flavor.deep,
    };
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.flavor = flavor.id;
  }, [flavor]);

  const setFlavor = useCallback((id: FlavorId) => setFlavorId(id), []);

  const [wipe, setWipe] = useState<WipeRequest | null>(null);
  const busy = useRef(false);
  const current = useRef(flavorId);
  current.current = flavorId;
  const pourTo = useCallback((id: FlavorId, origin?: { x: number; y: number }) => {
    if (id === current.current || busy.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setFlavorId(id);
    busy.current = true;
    setWipe({
      key: Date.now(),
      flavor: FLAVOR_BY_ID[id],
      x: origin?.x ?? window.innerWidth / 2,
      y: origin?.y ?? window.innerHeight / 2,
    });
  }, []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setFlavorId((cur) => {
        const i = FLAVORS.findIndex((f) => f.id === cur);
        return FLAVORS[(i + dir + FLAVORS.length) % FLAVORS.length].id;
      }),
    [],
  );

  const value = useMemo(
    () => ({ flavor, flavorIndex, setFlavor, pourTo, next: () => step(1), prev: () => step(-1) }),
    [flavor, flavorIndex, setFlavor, pourTo, step],
  );

  return (
    <FlavorContext.Provider value={value}>
      {children}
      {wipe && (
        <FlavorWipe
          key={wipe.key}
          req={wipe}
          onPeak={() => setFlavorId(wipe.flavor.id)}
          onDone={() => {
            busy.current = false;
            setWipe(null);
          }}
        />
      )}
    </FlavorContext.Provider>
  );
}

export function useFlavor() {
  const ctx = useContext(FlavorContext);
  if (!ctx) throw new Error("useFlavor must be used inside <FlavorProvider>");
  return ctx;
}
