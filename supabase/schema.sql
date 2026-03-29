-- Enable Row Level Security (RLS) is essential for security
-- We will enable it for each table we create

-- 1. Bookings Table
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  business_id text not null, -- Stores the business ID string e.g. "luton-elec-1"
  trade text not null,
  city text not null,
  scheduled_at timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.bookings enable row level security;

create policy "Users can translate their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- 2. Favorites Table (matching FavoriteBusiness interface)
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  business_id text not null,
  business_name text not null, -- Denormalized for easier display
  trade_name text,
  city text,
  notes text,
  saved_at timestamp with time zone default now(),
  unique(user_id, business_id) -- Prevent duplicate favorites
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id);

-- 3. Reviews Table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  business_id text not null,
  rating numeric(2,1) check (rating >= 0 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

-- Reviews are publicly readable!
create policy "Reviews are publicly visible"
  on public.reviews for select
  using (true);

create policy "Users can insert their own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

-- 4. Quote Requests (Matching QuoteRequestHistory interface)
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  business_id text not null,
  business_name text,
  trade_name text,
  urgency text,
  description text not null,
  status text check (status in ('pending', 'quoted', 'accepted', 'declined', 'completed')) default 'pending',
  quote_amount numeric(10,2),
  quote_currency text default 'GBP',
  quote_valid_until timestamp with time zone,
  quote_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.quote_requests enable row level security;

create policy "Users can view their own quote requests"
  on public.quote_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quote requests"
  on public.quote_requests for insert
  with check (auth.uid() = user_id);
