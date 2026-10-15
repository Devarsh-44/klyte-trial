"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { NAV_LINKS } from "@/lib/data";
import { useCart } from "@/components/providers/cart-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Magnetic } from "@/components/ui/magnetic";
import { Logo } from "@/components/ui/logo";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { EASE_OUT, cn } from "@/lib/utils";

export function Nav() {
  const { scrollYProgress, scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const lenis = useLenis();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 560 && y > prev + 2);
  });

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (!lenis) return;
    e.preventDefault();
    lenis.scrollTo(href, { offset: -24, duration: 1.3 });
  };

  return (
    <>
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: hidden && !menuOpen ? -110 : 0, opacity: 1 }}
      transition={{ duration: hidden ? 0.25 : 0.45, ease: EASE_OUT }}
      className="fixed inset-x-0 top-0 z-50 flex flex-col items-center px-4 pt-4"
    >
      <nav
        aria-label="Primary"
        className={cn(
          "relative flex w-full max-w-6xl items-center justify-between gap-3 overflow-hidden rounded-full py-2 pl-5 pr-2 transition-[background-color,border-color] duration-500",
          scrolled || menuOpen ? "glass-strong" : "border border-transparent",
        )}
      >
        <a
          href="#top"
          onClick={(e) => go(e, "#top")}
          aria-label="Klyte home"
        >
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="rounded-full px-4 py-2 text-sm text-fg/60 transition-colors duration-200 hover:text-fg"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative grid size-10 place-items-center rounded-full text-fg/80 transition-[color,transform] duration-150 ease-out hover:text-fg active:scale-[0.96]"
          >
            <ShoppingBag className="size-[18px]" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 font-mono text-[10px] leading-none text-on-accent tabular"
                  data-accent-fade
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <Magnetic strength={8} className="hidden sm:inline-flex">
            <a
              href="#buy"
              onClick={(e) => go(e, "#buy")}
              className="inline-flex h-10 items-center rounded-full bg-fg px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              Buy
            </a>
          </Magnetic>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-full text-fg/80 transition-[color,transform] duration-150 ease-out hover:text-fg active:scale-[0.96] md:hidden"
          >
            {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>

        <motion.span
          aria-hidden
          style={{ scaleX: progress }}
          className={cn(
            "absolute inset-x-8 bottom-0 h-px origin-left bg-accent transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-0",
          )}
          data-accent-fade
        />
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="glass-strong mt-2 w-full max-w-6xl origin-top rounded-3xl p-2 md:hidden"
          >
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="block rounded-2xl px-4 py-3.5 text-base text-fg/80 transition-colors duration-200 hover:bg-card hover:text-fg"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#buy"
              onClick={(e) => go(e, "#buy")}
              className="mt-1 flex h-12 items-center justify-center rounded-full bg-fg text-sm font-medium text-bg active:scale-[0.98] sm:hidden"
            >
              Buy
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    <CartDrawer />
    </>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full text-fg/80 transition-[color,transform] duration-150 ease-out hover:text-fg active:scale-[0.96]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -60, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 60, scale: 0.8 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="grid place-items-center"
        >
          {dark ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
