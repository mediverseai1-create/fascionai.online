import { cn } from "@/lib/utils";

export function FormAlert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-4 rounded-[var(--radius)] px-3.5 py-3 text-sm",
        variant === "error" && "bg-risk-soft text-risk",
        variant === "success" && "bg-good-soft text-good"
      )}
      role="status"
    >
      {children}
    </div>
  );
}
