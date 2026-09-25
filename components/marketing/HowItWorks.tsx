import { Eyebrow } from "@/components/ui/Eyebrow";

const STEPS = [
  {
    num: "01 / Connect",
    title: "Connect your data",
    desc: "AI receives your sales and inventory data via CSV or a POS/e-commerce sync. Most teams are live within a day.",
  },
  {
    num: "02 / Analyse",
    title: "AI analyzes & predicts",
    desc: "Sell-through, size curves, and demand patterns are modelled continuously, style by style, SKU by SKU, then projected forward.",
  },
  {
    num: "03 / Detect",
    title: "AI detects & recommends",
    desc: "Stockout risk, overstock, and emerging opportunities are flagged automatically — each with a specific reorder or markdown number attached.",
  },
  {
    num: "04 / Act",
    title: "Your team acts",
    desc: "Every recommendation comes with a quantity and a reason, exportable to your buying sheet. AI decides what needs attention; your team decides what to do.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-card border-t border-b border-line py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow>How the AI works</Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18]">
            Your AI business intelligence loop.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t border-line">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`pt-[30px] px-[26px] pb-6 md:pb-0 border-line border-b md:border-b-0 ${
                i !== STEPS.length - 1 ? "md:border-r" : ""
              }`}
            >
              <div className="font-mono text-xs text-brass mb-3.5">{step.num}</div>
              <h3 className="text-[17px] font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-[1.55]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
