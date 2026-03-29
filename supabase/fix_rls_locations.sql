-- Fix RLS to allow Anon/Public to seed data
drop policy if exists "Allow public read on locations" on public.locations;
drop policy if exists "Allow service role full access on locations" on public.locations;

-- Allow FULL access to public (for development/seeding)
create policy "Enable all access for public"
on public.locations
for all
to public
using (true)
with check (true);
