import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Variant = "good" | "risk" | "watch";

const variantClasses: Record<Variant, string> = {
  good: "bg-good-soft text-good",
  risk: "bg-risk-soft text-risk",
  watch: "bg-brass-soft text-brass",
};

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant: Variant;
}

export function Tag({ variant, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] px-2 py-[3px] rounded-[2px] font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
