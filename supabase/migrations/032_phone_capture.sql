create table if not exists pro_confirmation_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  trade text not null,
  city text not null,
  country text not null default 'GB',
  created_at timestamptz default now(),
  notified_at timestamptz
);

alter table pro_confirmation_requests enable row level security;

create policy "Anyone can insert phone requests"
  on pro_confirmation_requests for insert
  with check (true);
