import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
}

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsAnchor = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = AsButton | AsAnchor;

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-all duration-300 ease-out-expo active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "text-accent-fg bg-[linear-gradient(120deg,var(--accent),var(--accent-2))] bg-[length:160%_160%] " +
    "shadow-[0_10px_30px_-12px_var(--glow)] hover:shadow-[0_16px_40px_-12px_var(--glow)] hover:-translate-y-0.5 hover:bg-[position:100%_50%]",
  secondary:
    "glass text-fg hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-md",
  ghost: "text-fg-muted hover:bg-surface-hover hover:text-fg",
  outline:
    "border border-border-strong text-fg hover:border-fg/40 hover:bg-surface-hover",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10 p-0",
};

/**
 * Renders a <button>, or an <a> when `href` is given. External links get
 * `target="_blank"` and a safe `rel` automatically.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (typeof rest.href === "string") {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    const external = /^https?:\/\//.test(href) || href.startsWith("mailto:");
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const { type, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type ?? "button"} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
