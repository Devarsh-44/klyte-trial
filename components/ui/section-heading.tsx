import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionHeading({ kicker, title, aside, className, id }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        <p className="hud-label mb-4">{kicker}</p>
        <h2 id={id} className="text-balance font-display text-display-lg uppercase text-fg">
          {title}
        </h2>
      </div>
      {aside && <p className="max-w-xs text-sm leading-relaxed text-fg/55 md:text-right">{aside}</p>}
    </div>
  );
}
