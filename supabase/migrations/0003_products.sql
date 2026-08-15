-- 0003_products.sql
-- Products catalog, scoped to an organization.

-- Shared trigger function to auto-maintain updated_at columns. Reusable by
-- any future table that needs the same behavior.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sku text not null,
  style_name text not null,
  category text,
  color text,
  size text,
  cost numeric(12, 2),
  price numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku)
);

create index if not exists products_organization_id_idx
  on public.products (organization_id);

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

-- Org-scoped access pattern: a user may read/write a product row only if
-- they are a member of the owning organization.

create policy "products_select_member"
  on public.products for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "products_insert_member"
  on public.products for insert
  to authenticated
  with check (public.is_org_member(organization_id));

create policy "products_update_member"
  on public.products for update
  to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Deletes are restricted to org owners, since removing a product is
-- destructive to any linked sales/inventory history.
create policy "products_delete_owner"
  on public.products for delete
  to authenticated
  using (public.is_org_owner(organization_id));
