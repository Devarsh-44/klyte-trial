"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { FlavorId } from "@/lib/data";
import { ProductPanel } from "@/components/ui/product-panel";

export type PackKind = "can" | "pack6";

interface PanelState {
  open: boolean;
  flavorId: FlavorId;
  pack: PackKind;
  /** Bumps on every open so the panel resets quantity. */
  key: number;
}

interface PanelContextValue extends PanelState {
  openPanel: (flavorId: FlavorId, pack?: PackKind) => void;
  closePanel: () => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

/** One product panel for the whole page: hero (at 100%), lineup and where-to-buy open it. */
export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PanelState>({ open: false, flavorId: "melon-mode", pack: "can", key: 0 });
  const openPanel = useCallback(
    (flavorId: FlavorId, pack: PackKind = "can") => setState((s) => ({ open: true, flavorId, pack, key: s.key + 1 })),
    [],
  );
  const closePanel = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ ...state, openPanel, closePanel }), [state, openPanel, closePanel]);
  return (
    <PanelContext.Provider value={value}>
      {children}
      <ProductPanel />
    </PanelContext.Provider>
  );
}

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanel must be used inside <PanelProvider>");
  return ctx;
}
