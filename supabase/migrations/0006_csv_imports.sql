-- 0006_csv_imports.sql
-- Audit log of CSV file imports, scoped to an organization.

create table if not exists public.csv_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  filename text,
  row_count integer,
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists csv_imports_organization_id_idx
  on public.csv_imports (organization_id);

alter table public.csv_imports enable row level security;

-- Org-scoped access pattern: a user may read/write a csv_imports row only
-- if they are a member of the owning organization.

create policy "csv_imports_select_member"
  on public.csv_imports for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "csv_imports_insert_member"
  on public.csv_imports for insert
  to authenticated
  with check (public.is_org_member(organization_id));

create policy "csv_imports_update_member"
  on public.csv_imports for update
  to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Deletes are restricted to org owners; import history is an audit trail
-- and should not be casually erased by any member.
create policy "csv_imports_delete_owner"
  on public.csv_imports for delete
  to authenticated
  using (public.is_org_owner(organization_id));
