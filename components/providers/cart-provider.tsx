"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STICKERS } from "@/components/stickers/stickers";

interface CartContextValue {
  count: number;
  items: Record<string, number>;
  /** Add a SKU; `label` is what the confirmation sticker says. */
  add: (sku: string, label: string, qty?: number) => void;
  /** Set a line's quantity; 0 removes it. */
  setQty: (sku: string, qty: number) => void;
  lastAddedAt: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

interface Slap {
  id: number;
  label: string;
  sticker: number;
  rotate: number;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [lastAddedAt, setLastAddedAt] = useState(0);
  const [slaps, setSlaps] = useState<Slap[]>([]);
  const [open, setOpen] = useState(false);
  const nextSticker = useRef(0);

  const add = useCallback((sku: string, label: string, qty = 1) => {
    setItems((cur) => ({ ...cur, [sku]: (cur[sku] ?? 0) + qty }));
    setLastAddedAt(Date.now());
    // Delight moment: a brand sticker slaps on under the cart (max 3 on screen).
    const id = Date.now() + Math.random();
    const sticker = nextSticker.current++ % STICKERS.length;
    setSlaps((s) => [...s.slice(-2), { id, label, sticker, rotate: (Math.random() - 0.5) * 24 }]);
    window.setTimeout(() => setSlaps((s) => s.filter((x) => x.id !== id)), 2200);
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    setItems((cur) => {
      const next = { ...cur };
      if (qty > 0) next[sku] = qty;
      else delete next[sku];
      return next;
    });
  }, []);

  const count = Object.values(items).reduce((a, b) => a + b, 0);
  const value = useMemo(
    () => ({ count, items, add, setQty, lastAddedAt, open, setOpen }),
    [count, items, add, setQty, lastAddedAt, open],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-20 z-[65] flex flex-col items-end gap-2 md:right-8">
        <AnimatePresence>
          {slaps.map((s) => {
            const Sticker = STICKERS[s.sticker];
            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-center gap-3 rounded-2xl border border-line bg-bg/90 py-2 pl-2 pr-4 shadow-xl backdrop-blur-md"
              >
                {/* The slap: overshoot in scale + rotation, then settle. */}
                <motion.span
                  initial={{ scale: 1.6, rotate: s.rotate - 30, opacity: 0 }}
                  animate={{ scale: 1, rotate: s.rotate, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.45, bounce: 0.4 }}
                  className="grid size-10 place-items-center"
                >
                  <Sticker className="h-10 w-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />
                </motion.span>
                <span className="text-sm text-fg">
                  <span className="block text-xs text-fg/50">Added to cart</span>
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
