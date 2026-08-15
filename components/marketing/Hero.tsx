import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { KpiCounter } from "./KpiCounter";

export function Hero() {
  return (
    <section className="bg-wine text-white pt-[76px] pb-0 overflow-hidden" id="top">
      <div className="wrap">
        <div className="max-w-[700px] mx-auto text-center">
          <Eyebrow onDark className="justify-center">
            Inventory intelligence for fashion
          </Eyebrow>
          <h1 className="text-[clamp(34px,4.4vw,53px)] leading-[1.08] font-medium text-white">
            Know what to reorder <em className="italic text-brass-soft font-medium">before</em> you run out.
          </h1>
          <p className="mt-5 mx-auto text-[17px] leading-[1.6] text-white/78 max-w-[480px]">
            Facsion AI reads your sales and inventory data every night and tells you exactly which
            styles, sizes, and colours to reorder, markdown, or move — before the spreadsheet does.
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
          <div className="py-[22px] pb-[30px] border-b md:border-b-0 md:border-r border-white/16">
            <div className="font-serif text-[32px] font-medium text-white">
              <KpiCounter target={94} />%
            </div>
            <div className="mt-1.5 text-[12.5px] text-white/60">Demand forecast accuracy</div>
          </div>
          <div className="py-[22px] pb-[30px] border-b md:border-b-0 md:border-r border-white/16">
            <div className="font-serif text-[32px] font-medium text-white">
              -<KpiCounter target={23} />%
            </div>
            <div className="mt-1.5 text-[12.5px] text-white/60">
              Reduction in overstock, avg. 90 days
            </div>
          </div>
          <div className="py-[22px] pb-[30px]">
            <div className="font-serif text-[32px] font-medium text-white">
              <KpiCounter target={32} decimalScaled />x
            </div>
            <div className="mt-1.5 text-[12.5px] text-white/60">Faster reorder decisions</div>
          </div>
        </div>
      </div>
    </section>
  );
}
