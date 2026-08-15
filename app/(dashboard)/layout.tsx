import { requireOrgContext } from "@/lib/org";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await requireOrgContext();

  return (
    <DashboardShell
      organizationName={org.organizationName}
      plan={org.plan}
      userEmail={org.userEmail}
    >
      {children}
    </DashboardShell>
  );
}
