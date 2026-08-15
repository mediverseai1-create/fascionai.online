import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-line rounded-[var(--radius)]",
        hover &&
          "transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}
