import { requireOrgContext } from "@/lib/org";
import { hasAnyData } from "@/lib/data/inventory";
import { getRecentReports } from "@/lib/data/reports";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState, InlineEmptyNote } from "@/components/dashboard/EmptyState";

const REPORT_CARDS = [
  {
    type: "revenue",
    title: "Revenue summary",
    description: "Units sold and revenue per product over the last 90 days.",
  },
  {
    type: "products",
    title: "Product performance",
    description: "Stock on hand, sales velocity, and days of stock per product.",
  },
  {
    type: "opportunities",
    title: "Opportunities",
    description: "Rising/declining demand, high-value low-stock, and dead stock.",
  },
] as const;

const TYPE_LABEL: Record<string, string> = {
  revenue: "Revenue summary",
  products: "Product performance",
  opportunities: "Opportunities",
};

export default async function ReportsPage() {
  const org = await requireOrgContext();
  const hasData = await hasAnyData(org.organizationId);
  const recentReports = hasData ? await getRecentReports(org.organizationId) : [];

  if (!hasData) {
    return (
      <div>
        <PageHeader title="Reports" />
        <EmptyState
          title="No data yet"
          description="Import your sales and inventory data before generating reports."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generated from your current data — downloads as CSV." />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {REPORT_CARDS.map((report) => (
          <Card key={report.type} className="p-5 flex flex-col">
            <h3 className="font-serif text-lg mb-1.5">{report.title}</h3>
            <p className="text-sm text-muted flex-1 mb-4">{report.description}</p>
            <a
              href={`/api/reports?type=${report.type}`}
              className="text-sm text-wine font-semibold"
            >
              Download CSV →
            </a>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <Eyebrow>Recently generated</Eyebrow>
        {recentReports.length === 0 ? (
          <InlineEmptyNote>No reports generated yet.</InlineEmptyNote>
        ) : (
          <ul className="divide-y divide-line">
            {recentReports.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between text-sm">
                <span>{TYPE_LABEL[r.type] ?? r.type}</span>
                <span className="text-muted">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(r.generated_at))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
