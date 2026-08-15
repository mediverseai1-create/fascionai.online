import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/supabase/types";

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  scale: "Scale",
};

export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[11px] tracking-[0.06em] uppercase px-2 py-1 rounded-[2px]",
        plan === "free" ? "bg-line/60 text-muted" : "bg-brass-soft text-brass",
        className
      )}
    >
      {PLAN_LABEL[plan]} plan
    </span>
  );
}
