import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 mt-[3px] flex-shrink-0 text-good">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CROSS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 mt-[3px] flex-shrink-0 text-muted">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const TRADITIONAL = [
  "Shows dashboards, reports, and charts",
  "Exports raw sales and stock data",
  "Refreshes numbers on a schedule",
  "Your team interprets everything, every week",
];

const AI_NATIVE = [
  "Understands what changed and why it's changing",
  "Projects what's likely to happen next",
  "Surfaces what needs attention, ranked by priority",
  "Ships a specific recommendation with every alert",
];

export function BuiltForBusinessSection() {
  return (
    <section className="bg-card border-t border-b border-line py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow>Why it&apos;s different</Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18]">
            Built for business decisions, not just business data.
          </h2>
          <p className="mt-3.5 text-base text-muted leading-[1.6]">
            Traditional retail software and Facsion AI start from the same sales and inventory
            records. What each one does with them is different.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
          <Card className="p-[30px_26px]">
            <div className="text-[15px] font-semibold text-muted uppercase tracking-[0.04em]">
              Traditional business software
            </div>
            <ul className="list-none p-0 mt-6">
              {TRADITIONAL.map((item, i) => (
                <li
                  key={item}
                  className={`flex gap-2.5 items-start text-sm py-2.5 ${i !== 0 ? "border-t border-line" : ""}`}
                >
                  {CROSS}
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-[30px_26px] border-wine shadow-[0_10px_30px_rgba(92,26,52,0.14)]">
            <div className="text-[15px] font-semibold text-wine uppercase tracking-[0.04em]">
              Facsion AI
            </div>
            <ul className="list-none p-0 mt-6">
              {AI_NATIVE.map((item, i) => (
                <li
                  key={item}
                  className={`flex gap-2.5 items-start text-sm py-2.5 ${i !== 0 ? "border-t border-line" : ""}`}
                >
                  {CHECK}
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
