import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Klyte design tokens.
 *
 * Two runtime layers, both CSS variables on <html>:
 *  - theme  (data-theme="dark" | "light"): --bg, --fg, --card, --line
 *  - flavor (FlavorProvider):              --accent, --tint, --on-accent, --glow ...
 *
 * Every colour resolves through color-mix so opacity modifiers
 * (`text-fg/60`, `bg-accent/10`) keep working with runtime values.
 */
const mix = (v: string) => `color-mix(in srgb, var(${v}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: mix("--bg"),
        fg: mix("--fg"),
        card: "var(--card)",
        line: "var(--line)",
        accent: mix("--accent"),
        tint: mix("--tint"),
        "on-accent": mix("--on-accent"),
        glow: mix("--glow"),
        brand: { DEFAULT: mix("--brand"), deep: "var(--brand-deep)", blush: "var(--brand-blush)" },
        // Fixed brand references (docs + can art).
        melon: { DEFAULT: "#E5384B", rind: "#9BCB3C", glow: "#F7A8BE" },
        blueberry: { DEFAULT: "#2D6BE4", spirulina: "#28C1CB", glow: "#8FD3EC" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        wordmark: ["var(--font-wordmark)", "var(--font-display)", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.25rem, 7.2vw, 7.25rem)", { lineHeight: "0.9", letterSpacing: "-0.005em" }],
        "display-lg": ["clamp(2.5rem, 5vw, 4.75rem)", { lineHeight: "0.92" }],
        "display-md": ["clamp(1.875rem, 3.2vw, 3rem)", { lineHeight: "0.95" }],
        "mono-xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      },
      spacing: {
        section: "clamp(5rem, 10vw, 9rem)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translate3d(0,0,0)" },
          to: { transform: "translate3d(-50%,0,0)" },
        },
      },
    },
  },
  plugins: [
    plugin(({ addComponents, addUtilities }) => {
      addComponents({
        ".glass": {
          backgroundColor: "var(--card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--line)",
        },
        ".glass-strong": {
          backgroundColor: "var(--card-strong)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          border: "1px solid var(--line)",
        },
        ".hud-label": {
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: "0.6875rem",
          lineHeight: "1rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "color-mix(in srgb, var(--fg) 55%, transparent)",
        },
      });
      addUtilities({
        ".tabular": { fontVariantNumeric: "tabular-nums" },
        ".mask-fade-x": {
          maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        },
      });
    }),
  ],
};

export default config;
