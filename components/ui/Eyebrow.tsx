import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  onDark?: boolean;
}

export function Eyebrow({ onDark = false, className, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] uppercase border-l-2 border-brass pl-2.5 mb-[18px]",
        onDark ? "text-white/75" : "text-muted",
        className
      )}
      {...props}
    />
  );
}
