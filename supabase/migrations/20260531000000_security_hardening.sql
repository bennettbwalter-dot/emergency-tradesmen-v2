-- Tighten public-authenticated access that was too broad for production.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'nicholas.bennett247@gmail.com',
    'admin@example.com'
  )
  or coalesce(auth.jwt() ->> 'email', '') = current_setting('app.admin_email', true);
$$;

-- Blog posts: public can read published posts; only admins can preview drafts or mutate.
drop policy if exists "Public can read published posts" on public.posts;
drop policy if exists "Authenticated users can read all posts" on public.posts;
drop policy if exists "Authenticated users can manage posts" on public.posts;
drop policy if exists "Admins can read all posts" on public.posts;
drop policy if exists "Admins can manage posts" on public.posts;

create policy "Public can read published posts"
on public.posts
for select
using (published = true);

create policy "Admins can read all posts"
on public.posts
for select
using (public.is_admin());

create policy "Admins can manage posts"
on public.posts
for all
using (public.is_admin())
with check (public.is_admin());

-- Newsletter subscriptions: public signup stays open; subscriber list is admin-only.
drop policy if exists "Allow public subscriptions" on public.newsletter_subscriptions;
drop policy if exists "Allow authenticated users to view" on public.newsletter_subscriptions;
drop policy if exists "Admins can view newsletter subscriptions" on public.newsletter_subscriptions;

create policy "Allow public subscriptions"
on public.newsletter_subscriptions
for insert
with check (
  email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  and coalesce(status, 'active') in ('active', 'pending')
);

create policy "Admins can view newsletter subscriptions"
on public.newsletter_subscriptions
for select
using (public.is_admin());
