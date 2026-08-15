import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrganizationDetails(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, business_type, country, currency, team_size, plan, created_at")
    .eq("id", organizationId)
    .single();

  if (error) throw error;
  return data;
}
