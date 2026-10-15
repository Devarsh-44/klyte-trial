"use client";

import { motion } from "framer-motion";
import { NUTRITION } from "@/lib/data";
import { SectionHeading } from "@/components/ui/section-heading";
import { EASE_OUT } from "@/lib/utils";

/**
 * Quiet comparison table. The Klyte column is the only tinted surface, so the
 * eye reads down it first; everything else is hairlines and type.
 */
export function Nutrition() {
  return (
    <section id="nutrition" aria-labelledby="nutrition-title" className="relative px-5 py-section md:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="nutrition-title"
          kicker="Nutrition / per 250 ml"
          title={
            <>
              Klyte <span className="text-fg/35">vs. the usual can</span>
            </>
          }
          aside="Typical figures are a category average for a 250 ml energy drink."
          className="mb-12 md:mb-16"
        />

        <div className="relative">
          {/* Tinted Klyte column, sits behind the rows. */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-[38%] w-[32%] rounded-3xl bg-accent/[0.07] md:left-[40%] md:w-[30%]"
            data-accent-fade
          />
          <table className="relative w-full border-collapse text-left">
            <caption className="sr-only">Klyte compared with a typical energy drink, per 250 ml can</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[38%] py-5 pr-4 font-normal md:w-[40%]">
                  <span className="hud-label">Per can</span>
                </th>
                <th scope="col" className="w-[32%] px-4 py-5 font-normal md:w-[30%] md:px-8">
                  <span className="font-wordmark text-xl lowercase text-fg">klyte</span>
                </th>
                <th scope="col" className="px-4 py-5 font-normal md:px-8">
                  <span className="hud-label">Typical</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {NUTRITION.map((row, i) => (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
                  className="border-t border-line"
                >
                  <th scope="row" className="py-5 pr-4 text-sm font-normal text-fg/70 md:py-6 md:text-base">
                    {row.label}
                  </th>
                  <td className="px-4 py-5 font-display text-xl text-fg tabular md:px-8 md:py-6 md:text-3xl">
                    {row.klyte}
                  </td>
                  <td className="px-4 py-5 text-sm text-fg/45 tabular md:px-8 md:py-6 md:text-base">{row.legacy}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs text-fg/40">Indicative values for this concept. Always check the printed label.</p>
      </div>
    </section>
  );
}
