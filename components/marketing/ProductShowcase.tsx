import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { DashboardPreview } from "./DashboardPreview";

type IconVariant = "good" | "risk" | "brass";

const iconClasses: Record<IconVariant, string> = {
  good: "bg-good-soft text-good",
  risk: "bg-risk-soft text-risk",
  brass: "bg-brass-soft text-brass",
};

const PANELS: {
  variant: IconVariant;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    variant: "good",
    title: "AI Product Intelligence",
    desc: "AI ranks every style, colour, and size by real sell-through velocity and margin, so you know what's actually outperforming forecast.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
  {
    variant: "risk",
    title: "AI-Detected Slow Movers",
    desc: "AI flags styles falling behind their sell-through curve early enough to act with a promotion or reallocation, before they become dead stock.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="3 7 9 13 13 9 21 17" />
        <polyline points="14 17 21 17 21 10" />
      </svg>
    ),
  },
  {
    variant: "brass",
    title: "AI Overstock Detection",
    desc: "AI catches overbuys by size and colour before they turn into season-end markdowns, with a suggested action attached.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="9" x2="9" y2="21" />
      </svg>
    ),
  },
  {
    variant: "risk",
    title: "AI Stockout Prediction",
    desc: "AI calculates a projected stockout date for every bestseller from your actual sales velocity and lead time — not a guess.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
    ),
  },
  {
    variant: "good",
    title: "AI Sales Trend Detection",
    desc: "AI tracks demand shifts by category and channel as your data changes — not three weeks after the fact.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-6 4 3 5-8" />
      </svg>
    ),
  },
  {
    variant: "brass",
    title: "AI Reorder Recommendations",
    desc: "Every alert ships with a specific reorder quantity or markdown depth, calculated from your own data and ready to action.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 20V10M18 20V4M6 20v-4" />
      </svg>
    ),
  },
];

export function ProductShowcase() {
  return (
    <section id="product" className="py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow>AI at work</Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18]">
            AI turns raw sales and stock data into decisions your team can act on.
          </h2>
          <p className="mt-3.5 text-base text-muted leading-[1.6]">
            Connect your data once. Facsion AI&apos;s analysis engine keeps it current and
            continuously surfaces what actually needs a decision this week.
          </p>
        </div>

        <DashboardPreview />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px] mt-[22px]">
          {PANELS.map((panel) => (
            <Card key={panel.title} hover className="p-[26px]">
              <div
                className={`w-[34px] h-[34px] flex items-center justify-center rounded-[var(--radius)] mb-[18px] ${iconClasses[panel.variant]}`}
              >
                {panel.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{panel.title}</h3>
              <p className="text-[14.5px] text-muted leading-[1.55]">{panel.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
