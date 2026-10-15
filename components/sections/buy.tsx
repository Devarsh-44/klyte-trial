"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, MapPin, Plus, Search } from "lucide-react";
import { FLAVORS, FLAVOR_BY_ID, PACKS, PRICE, QUICK_COMMERCE, STOCKISTS } from "@/lib/data";
import { useCart } from "@/components/providers/cart-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { FizzButton } from "@/components/ui/fizz-button";
import { EASE_OUT, cn } from "@/lib/utils";

/**
 * How people in India actually buy a cold can: quick-commerce apps first,
 * a nearby shop second, and packs direct from the brand third.
 */

function CanSwatch({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span
      aria-hidden
      className="h-10 w-[22px] shrink-0 rounded-[5px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
      style={{ background: `linear-gradient(180deg, ${top} 0 45%, ${bottom})` }}
    />
  );
}

function QuickCommerce() {
  return (
    <div className="glass flex flex-col rounded-4xl p-6 md:p-7">
      <p className="hud-label">Order now</p>
      <h3 className="mt-3 text-xl font-medium text-fg">At your door, still cold.</h3>
      <ul className="mt-6 space-y-2">
        {QUICK_COMMERCE.map((q) => (
          <li key={q.name}>
            <a
              href={q.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Search Klyte on ${q.name} (opens in a new tab)`}
              className="group flex items-center justify-between rounded-2xl border border-line px-4 py-3.5 transition-[border-color,background-color] duration-200 hover:border-fg/25 hover:bg-card"
            >
              <span className="text-base font-medium text-fg">{q.name}</span>
              <span className="flex items-center gap-3">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[0.7rem] text-tint" data-accent-fade>
                  ~{q.eta}
                </span>
                <ArrowUpRight className="size-4 text-fg/40 transition-[color,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-6 text-xs text-fg/45">Availability varies by city. Links open the app.</p>
    </div>
  );
}

function StoreFinder() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<null | { city: string; stores: string[] } | "none">(null);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const hit = STOCKISTS.find((s) => s.city.toLowerCase() === q || s.pincodes.includes(q));
    setResult(hit ? { city: hit.city, stores: hit.stores } : "none");
  };

  return (
    <div className="glass flex flex-col rounded-4xl p-6 md:p-7">
      <p className="hud-label">Find a store</p>
      <h3 className="mt-3 text-xl font-medium text-fg">Grab one on the way.</h3>
      <form onSubmit={search} className="mt-6">
        <label htmlFor="store-q" className="sr-only">
          Pincode or city
        </label>
        <div className="flex items-center gap-2 rounded-full border border-line bg-card p-1.5 pl-4 focus-within:border-fg/40">
          <MapPin className="size-4 shrink-0 text-fg/45" />
          <input
            id="store-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pincode or city"
            autoComplete="postal-code"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-fg placeholder:text-fg/35 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search stores"
            className="grid size-9 place-items-center rounded-full bg-fg text-bg transition-transform duration-150 ease-out active:scale-[0.95]"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      <div className="mt-5 min-h-[7.5rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {result === null && (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-fg/50">
              Try <button type="button" onClick={() => setQuery("Anand")} className="text-fg underline decoration-line underline-offset-4">Anand</button>,{" "}
              <button type="button" onClick={() => setQuery("Vadodara")} className="text-fg underline decoration-line underline-offset-4">Vadodara</button> or{" "}
              <button type="button" onClick={() => setQuery("380015")} className="text-fg underline decoration-line underline-offset-4">380015</button>.
            </motion.p>
          )}
          {result === "none" && (
            <motion.p
              key="none"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="text-sm leading-relaxed text-fg/65"
            >
              Not on shelves near you yet. Order a pack, or check the delivery apps.
            </motion.p>
          )}
          {result && result !== "none" && (
            <motion.ul
              key={result.city}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="divide-y divide-line border-y border-line"
            >
              {result.stores.map((s) => (
                <li key={s} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-fg">{s}</span>
                  <span className="text-xs text-fg/45">{result.city}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Packs() {
  const { add } = useCart();
  return (
    <div className="glass flex flex-col rounded-4xl p-6 md:p-7">
      <p className="hud-label">Direct from Klyte</p>
      <h3 className="mt-3 text-xl font-medium text-fg">Stock the fridge.</h3>
      <ul className="mt-6 space-y-2">
        {PACKS.map((p) => {
          const swatches = p.flavor ? [FLAVOR_BY_ID[p.flavor]] : FLAVORS;
          return (
            <li key={p.sku} className="flex items-center gap-3 rounded-2xl border border-line p-3">
              <span className="flex -space-x-1.5">
                {swatches.map((f) => (
                  <CanSwatch key={f.id} top={f.can.top} bottom={f.can.bottom} />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg">{p.name}</span>
                <span className="block truncate text-xs text-fg/50">{p.size}</span>
              </span>
              <span className="font-mono text-sm text-fg tabular">
                {PRICE.currency}
                {p.price}
              </span>
              <FizzButton
                type="button"
                onClick={() => add(p.sku, p.name === "Variety pack" ? "Variety pack" : `${p.name} 6-pack`)}
                aria-label={`Add ${p.name} to cart`}
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-150 ease-out active:scale-[0.94]",
                )}
                data-accent-fade
              >
                <Plus className="size-4" />
              </FizzButton>
            </li>
          );
        })}
      </ul>
      <p className="mt-auto pt-6 text-xs text-fg/45">Packs ship to your door. Prices are for this concept.</p>
    </div>
  );
}

export function Buy() {
  return (
    <section id="buy" aria-labelledby="buy-title" className="relative px-5 py-section md:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="buy-title"
          kicker="Where to buy"
          title={
            <>
              Cold in ten minutes.
              <br />
              <span className="text-fg/35">Or by the dozen.</span>
            </>
          }
          aside="Quick-commerce in the big cities, shelves across Gujarat, and packs straight from us."
          className="mb-12 md:mb-16"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.15fr]">
          <QuickCommerce />
          <StoreFinder />
          <div className="md:col-span-2 lg:col-span-1">
            <Packs />
          </div>
        </div>
      </div>
    </section>
  );
}
