"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

const FAQS = [
  {
    q: "What data do I need to get started?",
    a: "A sales history export (SKU, size, colour, date, units sold) and current stock on hand. Most teams start with a CSV from their POS or Shopify export and connect a live sync afterward.",
  },
  {
    q: "Does Facsion AI place orders automatically?",
    a: "No. Facsion AI surfaces the recommendation and quantity; your buying team decides. Every suggestion can be exported to your existing buying sheet or purchase order system.",
  },
  {
    q: "How is this different from my POS reporting?",
    a: "POS reporting tells you what happened. Facsion AI models size curves and seasonality to tell you what to do next — which units to reorder, which to mark down, and by when.",
  },
  {
    q: "Can I use this across multiple brands or regions?",
    a: "Yes, on the Pro plan. You can separate catalogues by brand or region while viewing consolidated performance across your full portfolio.",
  },
  {
    q: "What does the free plan include?",
    a: "Up to 100 SKUs, manual CSV uploads, and a weekly refresh — enough to see best and slow movers before committing to a live sync.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18]">Frequently asked</h2>
        </div>
        <div>
          {FAQS.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div
                key={faq.q}
                className={`border-t border-line ${i === FAQS.length - 1 ? "border-b" : ""}`}
              >
                <button
                  className="flex justify-between items-center py-[22px] text-base font-semibold bg-transparent border-none w-full text-left text-ink"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  {faq.q}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={`flex-shrink-0 w-4 h-4 text-brass transition-transform duration-200 ${
                      open ? "rotate-45" : ""
                    }`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-[max-height] duration-250 ease-in-out"
                  style={{ maxHeight: open ? "240px" : "0px" }}
                >
                  <p className="pb-[22px] text-[14.5px] text-muted leading-[1.6] max-w-[640px]">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
