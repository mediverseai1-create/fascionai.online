-- 0007_reports.sql
-- Generated reports, scoped to an organization.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references auth.users(id),
  type text not null,
  params jsonb default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

create index if not exists reports_organization_id_idx
  on public.reports (organization_id);

alter table public.reports enable row level security;

-- Org-scoped access pattern: a user may read/write a report row only if
-- they are a member of the owning organization.

create policy "reports_select_member"
  on public.reports for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "reports_insert_member"
  on public.reports for insert
  to authenticated
  with check (public.is_org_member(organization_id));

create policy "reports_update_member"
  on public.reports for update
  to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Deletes are restricted to org owners, consistent with the other
-- org-scoped tables.
create policy "reports_delete_owner"
  on public.reports for delete
  to authenticated
  using (public.is_org_owner(organization_id));
