"use client";

import { MotionConfig } from "framer-motion";
import { CartProvider } from "./cart-provider";
import { FlavorProvider } from "./flavor-provider";
import { SmoothScroll } from "./smooth-scroll";
import { PanelProvider } from "./panel-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <FlavorProvider>
          <CartProvider>
            <SmoothScroll>
              <PanelProvider>{children}</PanelProvider>
            </SmoothScroll>
          </CartProvider>
        </FlavorProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
