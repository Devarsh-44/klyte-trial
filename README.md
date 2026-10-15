# Klyte — Outgrow the Ordinary

Flagship landing page concept for Klyte sparkling electrolyte hydration.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 3 · Framer Motion 12 · GSAP 3 + ScrollTrigger · Lenis · React Three Fiber 9 + drei 10 · Lucide

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (verified clean)
```

No external assets: the 3D can, label art and studio lighting are all generated in code, and fonts ship via npm (`geist`, `@fontsource/anton`, `@fontsource/titan-one`), so the site builds offline.

## Structure

```
app/
  layout.tsx            fonts, providers, grain overlay
  page.tsx              section order
  globals.css           tokens, Lenis CSS, proximity-glow + fizz effects
components/
  providers/            ThemeProvider (light/dark), FlavorProvider (live --accent), CartProvider, SmoothScroll (Lenis <-> GSAP ticker)
  three/                can-stage.tsx (R3F scene), label-texture.ts (canvas-painted can wrap)
  sections/             nav, hero, manifesto, bento ("edge"), lineup, nutrition, marquee, footer
  ui/                   Magnetic, CountUp, SectionHeading
lib/
  data.ts               ALL copy, flavors, nutrition, creators (MOCK values flagged inline)
  gsap.ts               plugin registration
  use-reduced-motion.ts hydration-safe reduced-motion hook
tailwind.config.ts      design tokens
```

## Brand decisions (from the Klyte Instagram)

- **Positioning:** the brand calls itself a *sparkling hydration drink*; the hero leads with "Hydration, recharged." and "Outgrow the ordinary." is the sign-off.
- **Master colour:** avatar magenta `#E6006E` for the logo badge, selection and brand moments; flavor colours for everything product-related.
- **Sticker system:** stickers appear only at delight moments (add to cart, newsletter success, the final Outgrow beat), max three on screen, white die-cut border, slapped on with an overshoot. Rules live in `components/stickers/stickers.tsx`.
- **Buying in India:** "Where to buy" leads with quick-commerce, then a store finder (pincode or city), then packs direct. Store and price data are MOCK.
- **Local voice:** Gujarati line in the footer and in the signup success message.
- **Honesty:** footer marks this as an unofficial concept redesign (the brand has its own live site).

## Design tokens

| Token | Value |
| --- | --- |
| Glass card | `var(--card)` + `blur(12px)` + `var(--line)` border (`.glass`) |
| Melon Mode | accent `#D92F43` (4.7:1 with white), can `#D52A2B` to `#98C73A`, halo `#F7A8BE` |
| Blueberry Spirulina | accent `#2D6BE4`, can `#0F2945` to `#28C1CB`, halo `#8FD3EC` |
| Themes | dark `#0B0B0C` / `#F4F1EA`, light `#F5F3EE` / `#141414` (toggle in nav, saved, follows OS by default) |
| Display | Anton (`font-display`, fluid `text-display-*` scale) |
| Technical | Geist Mono (`font-mono`, `.hud-label`) |
| Wordmark | Titan One (`font-wordmark`) |
| Easing | `ease-out-expo` `cubic-bezier(0.23,1,0.32,1)`, `ease-in-out-strong` `cubic-bezier(0.77,0,0.175,1)` |

The active flavor writes `--accent`, `--tint-*`, `--on-accent` and `--glow` on `<html>`; the theme swaps `--bg`, `--fg`, `--card`, `--line`. Every `*-accent` utility resolves through `color-mix()`, so opacity modifiers (`bg-accent/20`) work with a runtime hex.

## Motion notes

- **Flavor morph:** the CSS variable snaps; elements tagged `data-accent-fade` transition their own colours, and ambient lighting is three stacked gradients crossfaded on `opacity`. Nothing animates an inherited custom property per frame.
- **Hero:** desktop uses one full-bleed WebGL stage; the can is anchored at 72% width while procedural fruit (watermelon chunks, slices, mint / blueberries, lime wheels) orbits it with rising fizz. Switching flavor bursts the old fruit out and blooms the new set in.
- **Flavor pour:** clicking a flavor floods the screen from the click point in the new can's colours, lands the flavor name, then reveals the re-coloured page (`components/ui/flavor-wipe.tsx`, WAAPI clip-path).
- **How it hits:** a pinned, horizontally scrubbed 4-beat story (Crack, Fizz, Hydrate, Outgrow) with scroll-driven illustrations (`components/sections/ritual.tsx`). Stacks vertically on mobile.
- **Fizz buttons:** add-to-cart releases a small burst of bubbles from the click point.
- **Lineup:** a 260vh sticky runway; ScrollTrigger progress picks the flavor. Clicking the rail scrolls Lenis to that flavor. Mobile and reduced-motion get plain tabs.
- **Render loops pause off-screen** (R3F `frameloop`, marquee `useInView`).
- **Reduced motion:** Lenis off, GSAP scenes skipped via `gsap.matchMedia`, counters jump to final values, marquees static.

## Before shipping

- Replace values marked `MOCK` in `lib/data.ts` with the printed label.
- Creator handles/quotes are placeholders; use real, consented endorsements.
- Wire `DropForm` in `components/sections/footer.tsx` to an email provider.
