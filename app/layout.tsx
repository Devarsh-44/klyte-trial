import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/anton/400.css";
import "@fontsource/titan-one/400.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PourLoader } from "@/components/ui/pour-loader";
import { pourInitScript, themeInitScript } from "@/lib/init-scripts";

/** Absolute base for the share image. An explicit NEXT_PUBLIC_SITE_URL wins;
 *  on Vercel the production domain (or this deployment's URL) is used, so
 *  link previews work with no setup; locally it falls back to localhost. */
function siteUrl() {
  const { NEXT_PUBLIC_SITE_URL, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL } = process.env;
  if (NEXT_PUBLIC_SITE_URL) return NEXT_PUBLIC_SITE_URL;
  if (VERCEL_PROJECT_PRODUCTION_URL) return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
  if (VERCEL_URL) return `https://${VERCEL_URL}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Klyte — Outgrow the Ordinary",
  description:
    "Sparkling electrolyte hydration with zero caffeine and no added sugar. Melon Mode and Blueberry Spirulina.",
  openGraph: {
    title: "Klyte — Outgrow the Ordinary",
    description: "Sparkling hydration with zero caffeine and no added sugar.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0C" },
    { media: "(prefers-color-scheme: light)", color: "#F5F3EE" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript + pourInitScript }} />
      </head>
      <body>
        <PourLoader />
        <Providers>{children}</Providers>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
