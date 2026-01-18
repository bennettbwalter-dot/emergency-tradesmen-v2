-- Create locations table for USA Hierarchical System
create type location_type as enum ('state', 'metro', 'city', 'suburb');

create table if not exists public.locations (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null,
    type location_type not null,
    state_code text, -- e.g. 'TX', nullable for non-US or top-level? actually states themselves have state_code.
    parent_id uuid references public.locations(id) on delete cascade,
    hierarchy_path text[], -- cached path slugs for easy lookup e.g. ['tx', 'dallas-fort-worth', 'dallas']
    created_at timestamptz default now(),
    
    constraint unique_slug_parent unique (slug, parent_id),
    constraint unique_state_slug unique (slug, type) deferrable initially deferred -- Enforce unique state slugs globally if parent_id is null? 
);

-- Index for localized lookups
create index idx_locations_parent on public.locations(parent_id);
create index idx_locations_slug on public.locations(slug);
create index idx_locations_type on public.locations(type);
create index idx_locations_state_code on public.locations(state_code);

-- Enable RLS but allow public read
alter table public.locations enable row level security;

create policy "Allow public read on locations"
on public.locations for select
to public
using (true);

create policy "Allow service role full access on locations"
on public.locations for all
to service_role
using (true)
with check (true);
