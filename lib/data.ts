/**
 * Klyte — content layer.
 *
 * Everything the page renders lives here so copy, flavors and numbers can be
 * swapped without touching components. Values marked `MOCK` are portfolio
 * placeholders — replace them with figures from the printed label before
 * anything ships publicly.
 */

export type FlavorId = "melon-mode" | "blueberry-spirulina";

export interface Flavor {
  id: FlavorId;
  index: string;
  name: string;
  /** Primary UI accent (buttons, fills, rails). */
  hex: string;
  /** Text-safe accent on dark and light backgrounds. */
  tintDark: string;
  tintLight: string;
  /** Text colour on top of an accent-filled button. */
  onAccent: string;
  /** Secondary hue used in washes. */
  soft: string;
  /** Deep shade for shadows and dark-mode washes. */
  deep: string;
  /** Halo colour behind the can (the glowing disc from the brand films). */
  glow: string;
  /** Printed can wrap colours, sampled from the brand films. */
  can: { top: string; mid: string; bottom: string; stroke: string };
  profile: string;
  tagline: string;
  description: string;
  ingredients: string[];
  notes: { label: string; value: string }[];
}

export const FLAVORS: Flavor[] = [
  {
    id: "melon-mode",
    index: "01",
    name: "Melon Mode",
    hex: "#D92F43", // darkened from the can red so white text passes 4.5:1
    tintDark: "#FF7A8A",
    tintLight: "#C01F33",
    onAccent: "#FFFFFF",
    soft: "#9BCB3C",
    deep: "#48050F",
    glow: "#F7A8BE",
    can: { top: "#D52A2B", mid: "#C7542A", bottom: "#98C73A", stroke: "#8C1420" },
    profile: "Watermelon / Lime / Mint",
    tagline: "Summer, carbonated.",
    description:
      "Juicy watermelon up front, a squeeze of lime through the middle and a cool mint finish. Crisp, light and properly refreshing.",
    ingredients: ["Watermelon", "Lime", "Mint"],
    notes: [
      { label: "Top", value: "Fresh-cut watermelon" },
      { label: "Body", value: "Ripe melon, lime" },
      { label: "Finish", value: "Cool mint" },
    ],
  },
  {
    id: "blueberry-spirulina",
    index: "02",
    name: "Blueberry Spirulina",
    hex: "#2D6BE4",
    tintDark: "#7FB0FF",
    tintLight: "#1F52BF",
    onAccent: "#FFFFFF",
    soft: "#28C1CB",
    deep: "#0C1C46",
    glow: "#8FD3EC",
    can: { top: "#0F2945", mid: "#1A5E92", bottom: "#28C1CB", stroke: "#0A1A33" },
    profile: "Blueberry / Spirulina / Lime",
    tagline: "Deep blue, bright head.",
    description:
      "Dark, jammy blueberry lifted with a clean green note of spirulina. Smooth, a little tart, and calm in a way most cans are not.",
    ingredients: ["Blueberry", "Spirulina", "Lime"],
    notes: [
      { label: "Top", value: "Ripe blueberry" },
      { label: "Body", value: "Dark berry, a little tart" },
      { label: "Finish", value: "Clean and green" },
    ],
  },
];

export const FLAVOR_BY_ID = Object.fromEntries(FLAVORS.map((f) => [f.id, f])) as Record<FlavorId, Flavor>;

/** Single can: store price and launch price. Pack of 6 is ASSUMED (6 x launch
 *  price) until the brand confirms it; update both here and in PACKS. */
export const PRICE = { can: 149, canMrp: 169, pack6: 894, pack6Mrp: 1014, currency: "\u20B9" };

/** Master brand colour, from the Instagram avatar. Logo + brand moments only;
 *  flavor colours handle everything product-related. */
export const BRAND = { magenta: "#E6006E", deep: "#7A0035", blush: "#FFD6E6" };

export const POSITIONING = {
  category: "Sparkling hydration drink",
  promise: "Hydration, recharged.",
  signoff: "Outgrow the ordinary.",
};

export const NAV_LINKS = [
  { label: "How it hits", href: "#ritual" },
  { label: "Why Klyte", href: "#edge" },
  { label: "Flavors", href: "#lineup" },
  { label: "Where to buy", href: "#buy" },
  { label: "FAQ", href: "#faq" },
];

export const MANIFESTO =
  "Most cans borrow energy from tomorrow. Klyte recharges you with what your body actually runs on: electrolytes, vitamins and fibre. Zero caffeine, zero added sugar, no crash waiting at four o'clock. Sparkling hydration for people who outgrew the ordinary.";

/* ---------------------------------------------------------- Where to buy -- */

/** Quick-commerce search pages for "klyte". ETAs are MOCK. */
export const QUICK_COMMERCE = [
  { name: "Blinkit", eta: "10 min", href: "https://blinkit.com/s/?q=klyte" },
  { name: "Zepto", eta: "10 min", href: "https://www.zeptonow.com/search?query=klyte" },
  { name: "Instamart", eta: "15 min", href: "https://www.swiggy.com/instamart/search?query=klyte" },
];

export const STOCKISTS = [
  { city: "Anand", pincodes: ["388001", "388120", "388121"], stores: ["Station Road Superstore", "Vidyanagar Fresh, V.V. Nagar"] },
  { city: "Vadodara", pincodes: ["390001", "390007", "390020"], stores: ["Alkapuri Daily Needs", "Fatehgunj Supermarket"] },
  { city: "Ahmedabad", pincodes: ["380009", "380015", "380054"], stores: ["Navrangpura Corner Store", "Satellite Fresh Mart", "SG Highway Express"] },
];

export const PACKS: { sku: string; name: string; size: string; price: number; flavor: FlavorId | null }[] = [
  { sku: "melon-mode-6", name: "Melon Mode", size: "6 x 250 ml", price: PRICE.pack6, flavor: "melon-mode" },
  { sku: "blueberry-spirulina-6", name: "Blueberry Spirulina", size: "6 x 250 ml", price: PRICE.pack6, flavor: "blueberry-spirulina" },
  { sku: "variety-12", name: "Variety pack", size: "12 x 250 ml, both flavors", price: PRICE.pack6 * 2, flavor: null },
]; // pack prices follow the ASSUMED pack-of-6 price above

/** Everything the cart can hold: the packs plus single cans. */
export const CATALOG = [
  ...PACKS,
  ...FLAVORS.map((f) => ({ sku: `${f.id}-can`, name: f.name, size: "Single can, 250 ml", price: PRICE.can, flavor: f.id as FlavorId | null })),
];

/* ------------------------------------------------------------------- FAQ -- */

/** Set to a real wa.me link (with the brand's number) to make the FAQ footer a link. */
export const WHATSAPP_URL: string | null = null;

export const FAQ: { q: string; a: string; strike?: string }[] = [
  {
    q: "Is Klyte an energy drink?",
    strike: "energy drink",
    a: "Nope. It's sparkling hydration: electrolytes, B vitamins and fibre with zero caffeine. No spike, no crash.",
  },
  {
    q: "When should I drink it?",
    a: "Whenever you'd reach for something fizzy. After the gym, mid-afternoon, on a long ride, or the morning after. No caffeine means it works at 11 pm too.",
  },
  {
    q: "How fast is delivery?",
    a: "About 10 minutes on Blinkit, Zepto or Instamart where we're stocked. Packs ordered from us usually land in 2 to 4 days.",
  },
  {
    q: "How do I pay?",
    a: "UPI, cards and netbanking on our store. The quick-commerce apps take whatever you already use with them.",
  },
  {
    q: "Where's my order?",
    a: "Your confirmation message has a tracking link. If it hasn't moved in a day, message us and we'll chase it.",
  },
  {
    q: "Can arrived dented?",
    a: "Send us a photo within 48 hours of delivery and we'll replace it. No forms, no back and forth.",
  },
];

/* ------------------------------------------------------------- The edge -- */

export const EDGE_STATS = [
  { value: 0, unit: "mg", from: 80, label: "Caffeine", body: "No stimulant spike, no crash." },
  { value: 0, unit: "g", from: 27, label: "Added sugar", body: "Sweetness from fruit, not syrup." },
  { value: 5, unit: "", from: 0, label: "Electrolytes", body: "Na, K, Mg, Ca and Cl, balanced." },
  { value: 3, unit: "", from: 0, label: "Vitamins", body: "B6, B12 and C in every can." },
];

/* ------------------------------------------------------------ Nutrition -- */

export interface NutrientRow {
  label: string;
  klyte: string;
  legacy: string;
  note?: string;
}

/** Per 250 ml can. Legacy = category average for a 250 ml energy drink. */
export const NUTRITION: NutrientRow[] = [
  { label: "Caffeine", klyte: "0 mg", legacy: "80 mg" },
  { label: "Added sugar", klyte: "0 g", legacy: "27 g" },
  { label: "Energy", klyte: "18 kcal", legacy: "113 kcal", note: "MOCK" },
  { label: "Electrolytes", klyte: "5", legacy: "Sodium only" },
  { label: "Vitamins", klyte: "B6, B12, C", legacy: "B3, B6" },
  { label: "Dietary fibre", klyte: "3 g", legacy: "0 g", note: "MOCK" },
];

/* -------------------------------------------------------------- Marquee -- */

/** MOCK creator endorsements — placeholder handles for the portfolio build. */
export const CREATORS = [
  { handle: "@aarav.lifts", quote: "Gym bag staple now", tag: "Fitness" },
  { handle: "@meera.codes", quote: "Hackathon fuel, minus the jitters", tag: "Tech" },
  { handle: "@kabir.rides", quote: "Melts the heat on long rides", tag: "Cycling" },
  { handle: "@zoya.frames", quote: "The can alone is a whole aesthetic", tag: "Design" },
  { handle: "@dev.on.decks", quote: "Four-hour set, zero crash", tag: "Music" },
  { handle: "@tanvi.runs", quote: "My post-10K reset", tag: "Running" },
];

export const MARQUEE_WORDS = [
  "Hydration, recharged",
  "Outgrow the ordinary",
  "Zero caffeine",
  "No added sugar",
  "Five electrolytes",
  "Vitamins B6, B12 & C",
];

/** In-page links only. Add the brand's real social URLs here before shipping. */
export const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { label: "Variety pack", href: "#buy" },
      { label: "Melon Mode", href: "#lineup" },
      { label: "Blueberry Spirulina", href: "#lineup" },
    ],
  },
  {
    title: "Brand",
    links: [
      { label: "How it hits", href: "#ritual" },
      { label: "Why Klyte", href: "#edge" },
      { label: "Ingredients", href: "#nutrition" },
    ],
  },
  {
    title: "Find us",
    links: [
      { label: "Delivery apps", href: "#buy" },
      { label: "Stockists", href: "#buy" },
      { label: "Next drop", href: "#drop" },
    ],
  },
];
