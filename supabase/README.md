# Supabase migrations

This directory contains plain SQL migration files for the FACSION AI schema.
They are meant to be run **in order** (`0001_...` through `0007_...`) via
either:

- the Supabase Dashboard's SQL editor (paste and run each file in sequence), or
- the Supabase CLI, once a project is linked:
  - `supabase db push`, or
  - `supabase migration up`

## Status

**Nothing has been applied yet.** No Supabase project is connected to this
repo — credentials (project ref, DB URL, service role key, etc.) haven't
been provided. These files are authored and ready to run as soon as a
project is linked; until then they are inert SQL sitting in version control.

## Layout

| File | Contents |
| --- | --- |
| `0001_profiles.sql` | `profiles` table + `handle_new_user()` trigger on `auth.users` |
| `0002_organizations_and_members.sql` | `organizations`, `organization_members`, and their RLS policies |
| `0003_products.sql` | `products` table, `set_updated_at()` trigger function, indexes, RLS |
| `0004_sales_transactions.sql` | `sales_transactions` table, indexes, RLS |
| `0005_inventory_snapshots.sql` | `inventory_snapshots` table, indexes, RLS |
| `0006_csv_imports.sql` | `csv_imports` table, RLS |
| `0007_reports.sql` | `reports` table, RLS |

RLS policies are defined inline in each table's own migration file
(rather than a separate combined policies file), since every table after
`organizations`/`organization_members` follows the same simple org-membership
pattern and keeping the policy next to the table it governs is easier to
audit and change later.
