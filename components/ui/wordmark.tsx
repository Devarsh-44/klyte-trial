import { cn } from "@/lib/utils";

/** Bubble wordmark set in Titan One with a stacked outline. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-wordmark lowercase leading-none tracking-tight", className)}
      style={{
        WebkitTextStroke: "0.06em #0A0A0A",
        paintOrder: "stroke fill",
        textShadow: "0 0 0 #fff, 0.04em 0.04em 0 var(--accent)",
      }}
    >
      klyte
    </span>
  );
}
