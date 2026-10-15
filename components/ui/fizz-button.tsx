"use client";

import { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Button that releases a small burst of carbonation from the click point.
 * Bubbles are throwaway spans animated with WAAPI (transform + opacity).
 */
export const FizzButton = forwardRef<HTMLButtonElement, Props>(function FizzButton(
  { className, onClick, children, ...rest },
  forwarded,
) {
  const local = useRef<HTMLButtonElement | null>(null);

  const burst = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = local.current;
    if (!btn || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = btn.getBoundingClientRect();
    const ox = e.clientX ? e.clientX - r.left : r.width / 2;
    const oy = e.clientY ? e.clientY - r.top : r.height / 2;
    for (let i = 0; i < 12; i++) {
      const b = document.createElement("span");
      const size = 4 + Math.random() * 7;
      b.setAttribute("aria-hidden", "true");
      Object.assign(b.style, {
        position: "absolute",
        left: `${ox - size / 2}px`,
        top: `${oy - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "9999px",
        border: "1.5px solid currentColor",
        pointerEvents: "none",
      });
      btn.appendChild(b);
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const dist = 30 + Math.random() * 46;
      b.animate(
        [
          { transform: "translate(0,0) scale(0.6)", opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 12}px) scale(1)`,
            opacity: 0,
          },
        ],
        { duration: 550 + Math.random() * 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" },
      ).finished.then(() => b.remove());
    }
  };

  return (
    <button
      ref={(el) => {
        local.current = el;
        if (typeof forwarded === "function") forwarded(el);
        else if (forwarded) forwarded.current = el;
      }}
      className={cn("relative overflow-visible", className)}
      onClick={(e) => {
        burst(e);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});
