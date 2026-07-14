"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-[var(--radius-sm)] " +
  "transition-[background-color,box-shadow,color,transform] duration-150 " +
  "disabled:opacity-40 disabled:pointer-events-none select-none active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:bg-[var(--color-accent-strong)] " +
    "shadow-[var(--shadow-sm)] font-semibold",
  secondary:
    "bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-line)] " +
    "hover:border-[var(--color-line-strong)] hover:bg-[var(--color-elevated)]",
  ghost:
    "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]",
  danger:
    "bg-transparent text-[var(--color-danger)] border border-[var(--color-line)] hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] hover:border-[var(--color-danger)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
