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
