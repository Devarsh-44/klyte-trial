import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/anton/400.css";
import "@fontsource/titan-one/400.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { themeInitScript } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Klyte — Outgrow the Ordinary",
  description:
    "Sparkling electrolyte hydration with zero caffeine and no added sugar. Melon Mode and Blueberry Spirulina.",
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
