import { CtaBand } from "@/components/marketing/CtaBand";
import { FaqSection } from "@/components/marketing/FaqSection";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ProblemStats } from "@/components/marketing/ProblemStats";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function MarketingHome() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <ProblemStats />
      <ProductShowcase />
      <HowItWorks />
      <SecuritySection />
      <PricingSection />
      <FaqSection />
      <CtaBand />
      <SiteFooter />
    </>
  );
}
