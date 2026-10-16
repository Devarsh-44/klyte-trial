"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { FAQ, WHATSAPP_URL } from "@/lib/data";
import { EASE_OUT, cn } from "@/lib/utils";

/** Strike one phrase inside a question ("Is Klyte an ~~energy drink~~?"). */
function Question({ q, strike }: { q: string; strike?: string }) {
  if (!strike || !q.includes(strike)) return <>{q}</>;
  const [a, b] = q.split(strike);
  return (
    <>
      {a}
      <span className="relative text-fg/45">
        {strike}
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-[2px] -rotate-2 bg-[#D92F43]" />
      </span>
      {b}
    </>
  );
}

/** Short questions in Klyte's voice. One answer open at a time. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative px-5 py-section md:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div>
          <p className="hud-label mb-4">Fizzy questions</p>
          <h2 id="faq-title" className="font-display text-display-lg uppercase text-fg">
            Ask us
            <br />
            <span className="text-fg/35">anything.</span>
          </h2>
        </div>

        <div>
          <ul className="border-t border-line">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              const btnId = `${base}-q${i}`;
              const panelId = `${base}-a${i}`;
              return (
                <li key={item.q} className="border-b border-line">
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-medium text-fg md:text-lg"
                    >
                      <span>
                        <Question q={item.q} strike={item.strike} />
                      </span>
                      <Plus
                        aria-hidden
                        className={cn("size-4 shrink-0 text-fg/50 transition-transform duration-300 ease-out-expo", isOpen && "rotate-45")}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-lg pb-5 text-pretty leading-relaxed text-fg/60">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-sm text-fg/50">
            Still stuck?{" "}
            {WHATSAPP_URL ? (
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-fg underline underline-offset-4">
                Message us on WhatsApp
              </a>
            ) : (
              <span className="text-fg">Message us on WhatsApp.</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
