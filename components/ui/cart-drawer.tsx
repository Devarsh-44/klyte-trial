"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { CATALOG, FLAVORS, FLAVOR_BY_ID, PRICE } from "@/lib/data";
import { useCart } from "@/components/providers/cart-provider";
import { EASE_OUT } from "@/lib/utils";

const PACK_BY_SKU = Object.fromEntries(CATALOG.map((p) => [p.sku, p]));

/** Slide-in cart. Concept only: checkout is a stub until a store is wired up. */
export function CartDrawer() {
  const { items, count, setQty, open, setOpen } = useCart();
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const lines = Object.entries(items)
    .map(([sku, qty]) => ({ sku, qty, pack: PACK_BY_SKU[sku] }))
    .filter((l) => l.pack);
  const total = lines.reduce((sum, l) => sum + l.pack.price * l.qty, 0);

  // Freeze the page behind the drawer, close on Escape, and hand focus back.
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      returnFocus.current?.focus();
    };
  }, [open, lenis, setOpen]);

  const goShop = () => {
    setOpen(false);
    if (lenis) lenis.scrollTo("#buy", { offset: -24, duration: 1.2 });
    else document.getElementById("buy")?.scrollIntoView();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-bg shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <h2 id="cart-title" className="font-display text-3xl uppercase text-fg">
                Your cart <span className="text-fg/35 tabular">{count}</span>
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="grid size-10 place-items-center rounded-full border border-line text-fg/80 transition-[color,transform] duration-150 ease-out hover:text-fg active:scale-[0.95]"
              >
                <X className="size-4" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="size-8 text-fg/30" />
                <p className="text-sm text-fg/60">Nothing in here yet. Your fridge deserves better.</p>
                <button
                  type="button"
                  onClick={goShop}
                  className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-transform duration-150 ease-out active:scale-[0.97]"
                  data-accent-fade
                >
                  Browse packs
                </button>
              </div>
            ) : (
              <>
                <ul data-lenis-prevent className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-6">
                  {lines.map(({ sku, qty, pack }) => {
                    const swatches = pack.flavor ? [FLAVOR_BY_ID[pack.flavor]] : FLAVORS;
                    return (
                      <li key={sku} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                        <span className="flex -space-x-1.5">
                          {swatches.map((f) => (
                            <span
                              key={f.id}
                              aria-hidden
                              className="h-10 w-[22px] shrink-0 rounded-[5px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                              style={{ background: `linear-gradient(180deg, ${f.can.top} 0 45%, ${f.can.bottom})` }}
                            />
                          ))}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-fg">{pack.name}</span>
                          <span className="block text-xs text-fg/50">{pack.size}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setQty(sku, qty - 1)}
                            aria-label={`Remove one ${pack.name}`}
                            className="grid size-8 place-items-center rounded-full border border-line text-fg/70 hover:text-fg active:scale-[0.94]"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono text-sm text-fg tabular" aria-label={`Quantity ${qty}`}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(sku, qty + 1)}
                            aria-label={`Add one ${pack.name}`}
                            className="grid size-8 place-items-center rounded-full border border-line text-fg/70 hover:text-fg active:scale-[0.94]"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-line px-6 pb-8 pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="hud-label">Total</span>
                    <span className="font-display text-3xl text-fg tabular">
                      {PRICE.currency}
                      {total}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-fg text-sm font-medium text-bg opacity-60"
                  >
                    Checkout coming soon
                  </button>
                  <p className="mt-3 text-center text-xs text-fg/45">Concept build. Prices are placeholders.</p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
