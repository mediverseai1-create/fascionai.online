import { Eyebrow } from "@/components/ui/Eyebrow";

const STEPS = [
  {
    num: "01 / Connect",
    title: "Connect your data",
    desc: "Sync your POS, e-commerce platform, or upload a CSV export. Most teams are live within a day.",
  },
  {
    num: "02 / Analyse",
    title: "Facsion AI analyses",
    desc: "Sell-through, size curves, and seasonality are modelled overnight, style by style, SKU by SKU.",
  },
  {
    num: "03 / Review",
    title: "Review what needs action",
    desc: "Each morning, your dashboard surfaces only the styles that need a reorder, markdown, or transfer.",
  },
  {
    num: "04 / Act",
    title: "Act with a number, not a guess",
    desc: "Every recommendation comes with a quantity and a reason, exportable straight to your buying sheet.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-card border-t border-b border-line py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18]">
            From raw sales data to a reorder decision in four steps.
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
