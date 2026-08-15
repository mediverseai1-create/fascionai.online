import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PRICING_PLANS, getPaymentLink } from "@/lib/pricing";

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 mt-[3px] flex-shrink-0 text-good">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-24">
      <div className="wrap">
        <div className="max-w-[620px] mb-[52px]">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.18]">
            Priced for the size of your catalogue, not your headcount.
          </h2>
          <p className="mt-3.5 text-base text-muted leading-[1.6]">
            Start free. Move to a paid plan when you&apos;re ready to connect live data and get
            reorder recommendations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[22px] items-stretch">
          {PRICING_PLANS.map((plan) => {
            const featured = plan.id === "starter";
            const comingSoon = plan.paymentLinkEnvVar !== null && !getPaymentLink(plan);
            return (
              <Card
                key={plan.id}
                className={`p-[30px_26px] flex flex-col relative ${
                  featured ? "border-wine shadow-[0_10px_30px_rgba(92,26,52,0.14)]" : ""
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-[26px] bg-wine text-white font-mono text-[11px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-[2px]">
                    Most popular
                  </span>
                )}
                <div className="text-[15px] font-semibold text-muted uppercase tracking-[0.04em]">
                  {plan.name}
                </div>
                <div className="font-serif text-[44px] mt-3.5 text-ink">
                  {plan.price}
                  <span className="text-[15px] font-sans text-muted font-medium">
                    {plan.priceDetail}
                  </span>
                </div>
                <p className="mt-2.5 text-[13.5px] text-muted leading-[1.5]">
                  {plan.description}
                </p>
                <ul className="list-none p-0 my-[26px] mb-7 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={feature}
                      className={`flex gap-2.5 items-start text-sm py-2 ${
                        i !== 0 ? "border-t border-line" : ""
                      }`}
                    >
                      {CHECK}
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === "free" ? (
                  <ButtonLink href="/signup" variant={featured ? "primary" : "ghost"}>
                    Sign up free
                  </ButtonLink>
                ) : comingSoon ? (
                  <span className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-6 py-[13px] text-[14.5px] font-semibold border border-line text-muted cursor-not-allowed">
                    Coming soon
                  </span>
                ) : (
                  <ButtonLink
                    href="/signup"
                    variant={featured ? "primary" : "ghost"}
                  >
                    Sign up free
                  </ButtonLink>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
