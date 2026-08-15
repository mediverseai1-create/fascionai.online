-- 0005_inventory_snapshots.sql
-- Point-in-time inventory levels per product, scoped to an organization.

create table if not exists public.inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_on_hand integer not null default 0,
  as_of_date date not null,
  lead_time_days integer default 14,
  created_at timestamptz not null default now(),
  unique (organization_id, product_id, as_of_date)
);

create index if not exists inventory_snapshots_org_product_idx
  on public.inventory_snapshots (organization_id, product_id);

create index if not exists inventory_snapshots_org_as_of_date_idx
  on public.inventory_snapshots (organization_id, as_of_date);

alter table public.inventory_snapshots enable row level security;

-- Org-scoped access pattern: a user may read/write an inventory snapshot
-- only if they are a member of the owning organization.

create policy "inventory_snapshots_select_member"
  on public.inventory_snapshots for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "inventory_snapshots_insert_member"
  on public.inventory_snapshots for insert
  to authenticated
  with check (public.is_org_member(organization_id));

create policy "inventory_snapshots_update_member"
  on public.inventory_snapshots for update
  to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Deletes are restricted to org owners, consistent with other historical
-- data tables (sales_transactions, products).
create policy "inventory_snapshots_delete_owner"
  on public.inventory_snapshots for delete
  to authenticated
  using (public.is_org_owner(organization_id));
