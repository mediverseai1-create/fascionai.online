-- ==== supabase/migrations/0001_profiles.sql ====
-- 0001_profiles.sql
-- Profiles table: one row per auth.users row, holding app-facing user data.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read their own profile only.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- A user may update their own profile only.
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Standard Supabase pattern: auto-create a profile row whenever a new
-- auth.users row is inserted, so app code never has to do it manually.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ==== supabase/migrations/0002_organizations_and_members.sql ====
-- 0002_organizations_and_members.sql
-- Organizations (tenants) and their membership table.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text,
  country text,
  currency text not null default 'USD',
  team_size text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'scale')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- ---------------------------------------------------------------------------
-- Membership helper functions
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER + a fixed search_path lets these run as the function
-- owner, which bypasses RLS on organization_members for the lookup itself.
-- This is required, not just a style choice: a policy ON organization_members
-- that subqueries organization_members from within its own USING clause
-- causes Postgres to re-evaluate that same RLS policy while already
-- evaluating it ("infinite recursion detected in policy for relation
-- organization_members"). Routing the lookup through a SECURITY DEFINER
-- function breaks that cycle. All org-scoped policies (here and in later
-- migrations) use these functions instead of inline subqueries.

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_owner(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_org_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- organizations policies
-- ---------------------------------------------------------------------------

-- A user may see an organization only if they belong to it.
create policy "organizations_select_member"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

-- Any authenticated user may create an org (onboarding flow), as long as
-- they set themselves as the creator. Membership row is inserted separately
-- by the app immediately after, via the organization_members insert policy.
create policy "organizations_insert_self_created"
  on public.organizations for insert
  to authenticated
  with check (created_by = auth.uid());

-- Only owners of the org may update its settings (name, plan, etc).
create policy "organizations_update_owner"
  on public.organizations for update
  to authenticated
  using (public.is_org_owner(id))
  with check (public.is_org_owner(id));

-- ---------------------------------------------------------------------------
-- organization_members policies
-- ---------------------------------------------------------------------------

-- A user may see their own membership rows, and rows for any org they are
-- already a member of (so teammates are visible to each other). Uses the
-- SECURITY DEFINER helper to avoid self-referencing RLS recursion.
create policy "organization_members_select_own_or_teammates"
  on public.organization_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_org_member(organization_id)
  );

-- MVP: a user may only add themselves as a member (this is how the creator
-- of a new org joins it as 'owner' during onboarding). Inviting OTHER users
-- as members is a "coming soon" team-invite feature and intentionally has
-- no insert policy yet — such inserts must go through a service-role path
-- once that feature is built.
create policy "organization_members_insert_self"
  on public.organization_members for insert
  to authenticated
  with check (user_id = auth.uid());


-- ==== supabase/migrations/0003_products.sql ====
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


-- ==== supabase/migrations/0004_sales_transactions.sql ====
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


-- ==== supabase/migrations/0005_inventory_snapshots.sql ====
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


-- ==== supabase/migrations/0006_csv_imports.sql ====
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


-- ==== supabase/migrations/0007_reports.sql ====
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


-- ==== supabase/migrations/0008_fix_organizations_select_for_creator.sql ====
-- 0008_fix_organizations_select_for_creator.sql
-- Fixes a real-world RLS bug hit during onboarding testing: Postgres gates
-- the RETURNING clause of INSERT ... RETURNING by the table's SELECT
-- policy, not just the INSERT WITH CHECK clause. Our onboarding flow does
-- `.insert({...}).select().single()` to get the new org's id back, but at
-- that point the creator isn't a member yet (the organization_members row
-- is inserted in a second, separate statement right after) — so the old
-- organizations_select_member policy couldn't see the row it just
-- created, and PostgREST reported it as "new row violates row-level
-- security policy for table organizations", even though the INSERT itself
-- was allowed. Confirmed by testing the same insert with
-- `Prefer: return=minimal` (no RETURNING), which succeeded.
--
-- Fix: let the creator see an org they created, even before their
-- membership row exists. This does not weaken tenant isolation — it only
-- ever exposes a row to the single user who set themselves as created_by.

drop policy if exists "organizations_select_member" on public.organizations;

create policy "organizations_select_member"
  on public.organizations for select
  to authenticated
  using (
    public.is_org_member(id) or created_by = auth.uid()
  );


