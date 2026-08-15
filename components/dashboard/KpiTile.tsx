import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function KpiTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "risk";
}) {
  return (
    <Card className="p-5">
      <p className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-muted mb-2">
        {label}
      </p>
      <p
        className={cn(
          "font-serif text-[28px] leading-none",
          tone === "good" && "text-good",
          tone === "risk" && "text-risk"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-[12.5px] text-muted">{hint}</p>}
    </Card>
  );
}
