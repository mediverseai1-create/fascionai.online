import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const CAPABILITIES = [
  { word: "Continuous", label: "AI monitoring of your sales and stock, every day" },
  { word: "Predictive", label: "Stockout dates and reorder quantities, not guesswork" },
  { word: "Actionable", label: "Every alert ships with a number and a reason" },
];

export function Hero() {
  return (
    <section className="bg-wine text-white pt-[76px] pb-0 overflow-hidden" id="top">
      <div className="wrap">
        <div className="max-w-[700px] mx-auto text-center">
          <Eyebrow onDark className="justify-center">
            AI-native inventory intelligence for fashion businesses
          </Eyebrow>
          <h1 className="text-[clamp(34px,4.4vw,53px)] leading-[1.08] font-medium text-white">
            Know what to reorder <em className="italic text-brass-soft font-medium">before</em> you run out.
          </h1>
          <p className="mt-5 mx-auto text-[17px] leading-[1.6] text-white/78 max-w-[480px]">
            Facsion AI continuously analyzes your sales, stock, and demand patterns, then tells your
            team exactly which styles, sizes, and colours to reorder, markdown, or move. Not a
            dashboard to interpret — a system that already did the analysis.
          </p>
          <div className="flex gap-3.5 mt-8 flex-wrap justify-center">
            <ButtonLink href="/signup" variant="wine">
              Sign up free
            </ButtonLink>
            <ButtonLink href="/login" variant="ghost-wine">
              Log in
            </ButtonLink>
          </div>
          <p className="mt-4 text-[12.5px] text-white/55">
            No credit card required · Connects to your existing POS or CSV export
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 mt-14 border-t border-white/16">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.word}
              className={`py-[22px] pb-[30px] ${
                i !== CAPABILITIES.length - 1 ? "border-b md:border-b-0 md:border-r border-white/16" : ""
              }`}
            >
              <div className="font-serif text-[28px] font-medium text-brass-soft">{cap.word}</div>
              <div className="mt-1.5 text-[12.5px] text-white/60">{cap.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
