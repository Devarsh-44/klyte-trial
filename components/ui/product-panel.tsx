"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { FLAVORS, FLAVOR_BY_ID, PRICE, type FlavorId } from "@/lib/data";
import { useCart } from "@/components/providers/cart-provider";
import { usePanel, type PackKind } from "@/components/providers/panel-provider";
import { useMediaQuery } from "@/lib/use-media-query";
import { EASE_OUT, cn } from "@/lib/utils";

const fmt = (n: number) => `${PRICE.currency}${n.toLocaleString("en-IN")}`;

/**
 * The buy panel: slides in from the right on desktop, rises as a bottom sheet
 * on phones. Single can or pack of 6, a quantity stepper, and a shortcut to
 * the quick-commerce apps.
 */
export function ProductPanel() {
  const { open, flavorId, pack: initialPack, key, closePanel } = usePanel();
  const { add } = useCart();
  const lenis = useLenis();
  const desktop = useMediaQuery("(min-width: 768px)");
  const [flavor, setFlavor] = useState<FlavorId>(flavorId);
  const [pack, setPack] = useState<PackKind>(initialPack);
  const [qty, setQty] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Every open starts fresh from what the caller asked for.
  useEffect(() => {
    setFlavor(flavorId);
    setPack(initialPack);
    setQty(1);
  }, [key, flavorId, initialPack]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    lenis?.stop();
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open, lenis, closePanel]);

  const f = FLAVOR_BY_ID[flavor];
  const price = pack === "can" ? PRICE.can : PRICE.pack6;
  const mrp = pack === "can" ? PRICE.canMrp : PRICE.pack6Mrp;
  const sku = pack === "can" ? `${flavor}-can` : `${flavor}-6`;

  const addToCart = () => {
    add(sku, `${qty} x ${f.name} ${pack === "can" ? "can" : "6-pack"}`, qty);
    closePanel();
  };
  const goApps = () => {
    closePanel();
    window.setTimeout(() => {
      if (lenis) lenis.scrollTo("#buy", { offset: -24, duration: 1.2 });
      else document.getElementById("buy")?.scrollIntoView();
    }, 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            onClick={closePanel}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            initial={desktop ? { x: "100%" } : { y: "100%" }}
            animate={desktop ? { x: 0 } : { y: 0 }}
            exit={desktop ? { x: "100%" } : { y: "100%" }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className={cn(
              "absolute flex flex-col overflow-hidden bg-[#111112] text-[#F4F1EA] shadow-2xl",
              desktop ? "inset-y-0 right-0 w-full max-w-[440px] border-l border-white/10" : "inset-x-0 bottom-0 max-h-[88svh] rounded-t-[28px]",
            )}
          >
            {!desktop && <span aria-hidden className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-white/25" />}

            {/* Can, on its flavor's glow */}
            <div className={cn("relative shrink-0 overflow-hidden", desktop ? "h-[44svh]" : "h-[30svh]")}>
              {FLAVORS.map((fl) => (
                <div
                  key={fl.id}
                  aria-hidden
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    opacity: fl.id === flavor ? 1 : 0,
                    background: `radial-gradient(60% 70% at 50% 55%, ${fl.glow}66, transparent 70%), linear-gradient(180deg, ${fl.can.top}55, transparent 80%)`,
                  }}
                />
              ))}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={flavor}
                  src={`/media/can-${flavor}.webp`}
                  alt={`${f.name} can`}
                  initial={{ y: 40, rotate: -8, opacity: 0 }}
                  animate={{ y: 0, rotate: -6, opacity: 1 }}
                  exit={{ y: -30, rotate: -2, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.55, bounce: 0.3 }}
                  className="absolute left-1/2 top-[6%] h-[92%] w-auto -translate-x-1/2 object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
                />
              </AnimatePresence>
              <button
                ref={closeRef}
                type="button"
                onClick={closePanel}
                aria-label="Close"
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/40 text-white/85 backdrop-blur-md transition-transform duration-150 ease-out hover:text-white active:scale-[0.95]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div data-lenis-prevent className="flex flex-col gap-5 overflow-y-auto overscroll-contain px-6 pb-7 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="hud-label !text-white/55">You picked</p>
                    <div role="radiogroup" aria-label="Flavor" className="flex gap-1.5">
                      {FLAVORS.map((fl) => (
                        <button
                          key={fl.id}
                          type="button"
                          role="radio"
                          aria-checked={fl.id === flavor}
                          aria-label={fl.name}
                          onClick={() => setFlavor(fl.id)}
                          className={cn(
                            "size-5 rounded-full ring-offset-2 ring-offset-[#111112] transition-shadow",
                            fl.id === flavor ? "ring-2 ring-white" : "ring-1 ring-white/25",
                          )}
                          style={{ background: `linear-gradient(180deg, ${fl.can.top}, ${fl.can.bottom})` }}
                        />
                      ))}
                    </div>
                  </div>
                  <h2 id="panel-title" className="mt-2 font-display text-[2.5rem] uppercase leading-[0.9]">
                    {f.name}
                  </h2>
                  <p className="mt-2 text-sm text-white/55">
                    Sparkling electrolyte · 250 ml · <span style={{ color: f.tintDark }}>launch price</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm text-white/40 line-through tabular">{fmt(mrp)}</p>
                  <p className="font-display text-[2.25rem] leading-none tabular">{fmt(price)}</p>
                </div>
              </div>

              <div role="radiogroup" aria-label="Size" className="relative grid grid-cols-2 rounded-2xl border border-white/10 p-1">
                <span
                  aria-hidden
                  className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white/10 transition-transform duration-300 ease-out-expo"
                  style={{ transform: pack === "pack6" ? "translateX(100%)" : "none" }}
                />
                {(
                  [
                    ["can", "Single can"],
                    ["pack6", "Pack of 6"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={pack === k}
                    onClick={() => setPack(k)}
                    className={cn("relative h-11 rounded-xl text-sm font-medium transition-colors", pack === k ? "text-white" : "text-white/50")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 items-center rounded-full border border-white/10">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Fewer"
                    className="grid size-12 place-items-center text-white/70 hover:text-white active:scale-[0.94]"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center font-mono tabular" aria-live="polite" aria-label={`Quantity ${qty}`}>
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(24, q + 1))}
                    aria-label="More"
                    className="grid size-12 place-items-center text-white/70 hover:text-white active:scale-[0.94]"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addToCart}
                  className="h-12 flex-1 rounded-full text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97]"
                  style={{ background: f.hex }}
                >
                  Add to cart · {fmt(price * qty)}
                </button>
              </div>

              <button
                type="button"
                onClick={goApps}
                className="group mx-auto inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white"
              >
                Need it now? Blinkit / Zepto in 10 min
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
