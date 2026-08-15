import { requireOrgContext } from "@/lib/org";
import { getProfile, getOrganizationDetails } from "@/lib/data/profile";
import { PRICING_PLANS, getPaymentLink } from "@/lib/pricing";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlanBadge } from "@/components/dashboard/PlanBadge";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { OrganizationForm } from "@/components/settings/OrganizationForm";

export default async function SettingsPage() {
  const org = await requireOrgContext();
  const [profile, orgDetails] = await Promise.all([
    getProfile(org.userId),
    getOrganizationDetails(org.organizationId),
  ]);

  const currentPlan = PRICING_PLANS.find((p) => p.id === org.plan)!;

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <Eyebrow>Your profile</Eyebrow>
          <ProfileForm
            userId={org.userId}
            fullName={profile.full_name}
            email={org.userEmail}
          />
        </Card>

        <Card className="p-6">
          <Eyebrow>Business details</Eyebrow>
          <OrganizationForm
            organizationId={org.organizationId}
            canEdit={org.role === "owner"}
            defaults={{
              name: orgDetails.name,
              businessType: orgDetails.business_type ?? "",
              country: orgDetails.country ?? "",
              currency: orgDetails.currency,
              teamSize: orgDetails.team_size ?? "",
            }}
          />
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <Eyebrow>Plan & billing</Eyebrow>
        <div className="flex items-center gap-3 mb-5">
          <PlanBadge plan={org.plan} />
          <span className="text-sm text-muted">
            {currentPlan.price}
            {currentPlan.priceDetail}
          </span>
        </div>

        {org.plan !== "scale" && (
          <>
            <p className="text-sm text-muted mb-4">
              Upgrade for more SKUs, live analytics, and priority support.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {PRICING_PLANS.filter((p) => p.id !== "free" && p.id !== org.plan).map(
                (plan) => {
                  const link = getPaymentLink(plan);
                  return (
                    <div
                      key={plan.id}
                      className="border border-line rounded-[var(--radius)] p-4"
                    >
                      <p className="font-semibold text-sm mb-1">{plan.name}</p>
                      <p className="font-serif text-xl mb-3">
                        {plan.price}
                        <span className="text-xs font-sans text-muted">
                          {plan.priceDetail}
                        </span>
                      </p>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full rounded-[var(--radius)] bg-ink text-white text-[13px] font-semibold py-2"
                        >
                          Upgrade to {plan.name}
                        </a>
                      ) : (
                        <span className="inline-flex items-center justify-center w-full rounded-[var(--radius)] border border-line text-muted text-[13px] font-semibold py-2 cursor-not-allowed">
                          Coming soon
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
            <p className="text-xs text-muted mt-4">
              Upgrades are processed by our payment provider outside this
              app. Your plan is updated on our end shortly after payment is
              confirmed.
            </p>
          </>
        )}
      </Card>

      <Card className="p-6">
        <Eyebrow>Account</Eyebrow>
        <SignOutButton />
      </Card>
    </div>
  );
}
