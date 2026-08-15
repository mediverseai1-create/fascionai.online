-- 0004_sales_transactions.sql
-- Recorded sales, scoped to an organization and linked to a product.

create table if not exists public.sales_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  revenue numeric(12, 2) not null check (revenue >= 0),
  sold_at date not null,
  created_at timestamptz not null default now()
);

create index if not exists sales_transactions_org_sold_at_idx
  on public.sales_transactions (organization_id, sold_at);

create index if not exists sales_transactions_org_product_idx
  on public.sales_transactions (organization_id, product_id);

alter table public.sales_transactions enable row level security;

-- Org-scoped access pattern: a user may read/write a sales row only if
-- they are a member of the owning organization.

create policy "sales_transactions_select_member"
  on public.sales_transactions for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "sales_transactions_insert_member"
  on public.sales_transactions for insert
  to authenticated
  with check (public.is_org_member(organization_id));

create policy "sales_transactions_update_member"
  on public.sales_transactions for update
  to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Deletes are restricted to org owners, since sales history feeds
-- reporting and should not be casually erased by any member.
create policy "sales_transactions_delete_owner"
  on public.sales_transactions for delete
  to authenticated
  using (public.is_org_owner(organization_id));
