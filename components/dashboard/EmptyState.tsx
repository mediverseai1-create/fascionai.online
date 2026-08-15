import { ButtonLink } from "@/components/ui/Button";

export function EmptyState({
  title,
  description,
  actionLabel = "Import your data",
  actionHref = "/dashboard/import",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="border border-dashed border-line rounded-[var(--radius)] px-6 py-14 text-center">
      <h3 className="font-serif text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-md mx-auto mb-6">
        {description}
      </p>
      <ButtonLink href={actionHref} variant="primary" size="sm">
        {actionLabel}
      </ButtonLink>
    </div>
  );
}

export function InlineEmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted py-6 text-center">{children}</p>
  );
}
