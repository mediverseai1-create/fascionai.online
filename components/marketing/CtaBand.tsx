import { ButtonLink } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section className="bg-wine text-white text-center py-16 sm:py-24">
      <div className="wrap">
        <h2 className="text-white text-[clamp(26px,3.4vw,38px)] max-w-[620px] mx-auto leading-[1.2]">
          Stop reading reports. Let AI tell you what to reorder next.
        </h2>
        <p className="mt-3.5 text-white/72 text-[15.5px]">
          Facsion AI turns your sales and inventory data into decisions your team can act on today
          — free plan, no card required.
        </p>
        <div className="flex gap-3.5 justify-center mt-[30px]">
          <ButtonLink href="/signup" variant="wine">
            Sign up free
          </ButtonLink>
          <ButtonLink href="/login" variant="ghost-wine">
            Log in
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
