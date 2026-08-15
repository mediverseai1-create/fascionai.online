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
