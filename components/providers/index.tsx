"use client";

import { MotionConfig } from "framer-motion";
import { CartProvider } from "./cart-provider";
import { FlavorProvider } from "./flavor-provider";
import { SmoothScroll } from "./smooth-scroll";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <FlavorProvider>
          <CartProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </CartProvider>
        </FlavorProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
