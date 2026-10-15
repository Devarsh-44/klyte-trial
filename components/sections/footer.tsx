"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Loader2 } from "lucide-react";
import { useLenis } from "lenis/react";
import { FOOTER_LINKS } from "@/lib/data";
import { EASE_OUT, cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { NoBadVibes } from "@/components/stickers/stickers";

type Status = "idle" | "loading" | "done" | "error";

function DropForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus("error");
    setStatus("loading");
    // Mock request: wire this to your email provider (Resend, Mailchimp, Klaviyo...).
    window.setTimeout(() => setStatus("done"), 900);
  };

  return (
    <form onSubmit={submit} noValidate className="relative w-full max-w-md">
      {/* Delight moment: the brand's sticker lands on success. */}
      <AnimatePresence>
        {status === "done" && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, scale: 1.8, rotate: -40 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.45 }}
            className="absolute -right-4 -top-14 w-20 drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] md:-right-10"
          >
            <NoBadVibes className="w-full" />
          </motion.span>
        )}
      </AnimatePresence>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border bg-card p-1.5 pl-5 transition-[border-color] duration-200 focus-within:border-fg/40",
          status === "error" ? "border-red-500/60" : "border-line",
        )}
      >
        <label htmlFor="drop-email" className="sr-only">
          Email address
        </label>
        <input
          id="drop-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          disabled={status === "done"}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby="drop-msg"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg placeholder:text-fg/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "done"}
          className="inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-fg px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.97] disabled:cursor-default"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status === "error" ? "idle" : status}
              initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="inline-flex items-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Joining
                </>
              ) : status === "done" ? (
                <>
                  <Check className="size-4" /> You&apos;re in
                </>
              ) : (
                <>
                  Join <ArrowRight className="size-4" />
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <p id="drop-msg" role="status" className="mt-3 min-h-5 pl-5 text-xs text-fg/50">
        {status === "error"
          ? "That email looks off. Try again?"
          : status === "done"
            ? "You're in. મજા આવશે! New flavors land in your inbox first."
            : "New flavors first. No spam, ever."}
      </p>
    </form>
  );
}

export function Footer() {
  const lenis = useLenis();

  return (
    <footer className="relative">
      {/* Newsletter */}
      <section id="drop" aria-labelledby="drop-title" className="px-5 pb-section md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 border-t border-line pt-16 md:grid-cols-2 md:items-end md:pt-20">
          <div>
            <p className="hud-label mb-4">Next drop</p>
            <h2 id="drop-title" className="font-display text-display-lg uppercase text-fg">
              Be first to
              <br />
              <span className="text-fg/35">the next flavor.</span>
            </h2>
          </div>
          <div className="md:justify-self-end">
            <DropForm />
          </div>
        </div>
      </section>

      {/* Links */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 border-t border-line px-5 py-14 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg/55">
            Sparkling hydration, recharged. Zero caffeine, no added sugar, nothing ordinary.
          </p>
          <p className="mt-3 text-sm text-fg/55" lang="gu">
            આણંદ, ગુજરાતથી પ્રેમ સાથે
          </p>
          <button
            type="button"
            onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0 }))}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-fg/65 transition-[color,transform] duration-150 ease-out hover:text-fg active:scale-[0.97]"
          >
            <ArrowUp className="size-3.5" /> Back to top
          </button>
        </div>
        {FOOTER_LINKS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="hud-label mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      if (!lenis) return;
                      e.preventDefault();
                      lenis.scrollTo(l.href, { offset: -24, duration: 1.3 });
                    }}
                    className="text-sm text-fg/65 transition-colors duration-200 hover:text-fg"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-line px-5 py-6 text-xs text-fg/40 md:flex-row md:justify-between md:px-8">
        <span>&copy; {new Date().getFullYear()} Klyte by SBG. Outgrow the ordinary.</span>
        <span>Unofficial concept redesign by Devarsh Kotak. Not affiliated with Klyte.</span>
      </div>
    </footer>
  );
}
