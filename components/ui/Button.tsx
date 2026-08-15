import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "wine" | "ghost" | "ghost-wine";
type Size = "default" | "sm";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:shadow-[var(--shadow-hover)] hover:-translate-y-px",
  wine: "bg-brass text-wine-dark hover:shadow-[0_8px_20px_rgba(169,130,76,0.35)] hover:-translate-y-px",
  ghost: "bg-transparent text-ink border border-line hover:border-ink",
  "ghost-wine":
    "bg-transparent text-white border border-white/35 hover:border-white",
};

const sizeClasses: Record<Size, string> = {
  default: "px-6 py-[13px] text-[14.5px]",
  sm: "px-4 py-[9px] text-[13.5px]",
};

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

interface ButtonProps
  extends ButtonBaseProps,
    ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold whitespace-nowrap transition-[box-shadow,transform,background] duration-150 disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
}

export function ButtonLink({
  variant = "primary",
  size = "default",
  className,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold whitespace-nowrap transition-[box-shadow,transform,background] duration-150",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
