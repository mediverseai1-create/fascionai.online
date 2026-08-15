import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getRecentReports(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id, type, generated_at")
    .eq("organization_id", organizationId)
    .order("generated_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
