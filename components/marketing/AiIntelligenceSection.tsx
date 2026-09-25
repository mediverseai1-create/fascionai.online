import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

const CAPABILITIES = [
  {
    title: "AI Analysis",
    desc: "Continuously analyzes your sales, inventory, and product data to surface what changed and what matters this week — not a report you have to dig through.",
  },
  {
    title: "AI Predictions",
    desc: "Calculates a projected stockout date for every style from your actual sell-through and lead time, so you see it coming instead of finding out after.",
  },
  {
    title: "AI Recommendations",
    desc: "Turns the analysis into a specific reorder quantity or markdown call, instead of leaving your team to interpret a chart.",
  },
  {
    title: "AI Alerts",
    desc: "Flags stockout risk, overstock, and shifting demand the moment your data shows it — not at the end of the month.",
  },
  {
    title: "AI Insight Briefings",
    desc: "A plain-language weekly summary of what's happening across your business, written from your own computed numbers. It never invents a statistic.",
  },
];

export function AiIntelligenceSection() {
  return (
    <section id="ai" className="py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow>The AI layer</Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18]">
            Your business data. Understood by AI.
          </h2>
          <p className="mt-3.5 text-base text-muted leading-[1.6]">
            Instead of another dashboard to interpret, Facsion AI continuously analyzes your sales
            and inventory data and turns it into decisions your team can act on — this is the
            engine every other page on this site describes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {CAPABILITIES.map((cap) => (
            <Card key={cap.title} hover className="p-[26px]">
              <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
              <p className="text-[14.5px] text-muted leading-[1.55]">{cap.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
