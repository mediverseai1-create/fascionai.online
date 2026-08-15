import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plan, MemberRole } from "@/lib/supabase/types";

export interface OrgContext {
  userId: string;
  userEmail: string | null;
  organizationId: string;
  organizationName: string;
  currency: string;
  plan: Plan;
  role: MemberRole;
}

/**
 * Server-only helper for dashboard pages/layouts. Redirects to /login if
 * unauthenticated (belt-and-braces alongside middleware) and to /onboarding
 * if the user has no organization yet.
 */
export async function requireOrgContext(): Promise<OrgContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, currency, plan")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (!org) {
    redirect("/onboarding");
  }

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    organizationId: membership.organization_id,
    organizationName: org.name,
    currency: org.currency,
    plan: org.plan,
    role: membership.role,
  };
}
