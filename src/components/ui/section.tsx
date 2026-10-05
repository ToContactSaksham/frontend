import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  id: string;
  children: ReactNode;
  /** Remove the max-width container (for full-bleed content). */
  bleed?: boolean;
}

export function Section({ id, className, children, bleed, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative section-pad scroll-mt-20", className)}
      {...rest}
    >
      {bleed ? children : <div className="container-x">{children}</div>}
    </section>
  );
}

interface HeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Number used in the eyebrow as a section index, e.g. 01 */
  index?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  index,
}: HeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-2xl md:mb-16",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <Reveal as="p" className="mb-3 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {index && <span className="text-fg-subtle">{index}</span>}
        <span className={cn("h-px w-8 bg-accent/60", align === "center" && "hidden")} aria-hidden />
        {eyebrow}
      </Reveal>
      <Reveal as="h2" delay={80} className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </Reveal>
      {description && (
        <Reveal as="p" delay={160} className="mt-4 text-pretty text-base leading-7 text-fg-muted md:text-lg">
          {description}
        </Reveal>
      )}
    </div>
  );
}
