import { cn } from "@/lib/utils";

/**
 * Klyte logo lockup: magenta monogram badge + bubble wordmark.
 * The badge carries the master brand colour so "Klyte" reads the same on
 * every flavor and in both themes.
 */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full font-wordmark text-[1.05rem] lowercase leading-none text-white",
        className,
      )}
      style={{ background: "radial-gradient(120% 120% at 30% 0%, var(--brand-deep) 0%, var(--brand) 55%, var(--brand-blush) 100%)" }}
    >
      <span className="-mt-0.5">k</span>
    </span>
  );
}

export function Logo({ className, wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Monogram />
      {wordmark && <span className="font-wordmark text-2xl lowercase leading-none text-fg">klyte</span>}
    </span>
  );
}
