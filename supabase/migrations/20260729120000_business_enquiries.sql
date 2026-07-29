-- Storage for claim-listing / website / general enquiries submitted through
-- BusinessEnquiryForm via the submit-business-enquiry edge function.
--
-- Neither the table nor the function existed. The form POSTed to a missing
-- endpoint, received a 404, and its own handler treated 404 as success, so
-- every enquiry showed the customer a confirmation and was then discarded.

create table if not exists public.business_enquiries (
    id                                  uuid primary key default gen_random_uuid(),
    created_at                          timestamptz not null default now(),
    region                              text not null check (region in ('UK', 'US')),
    business_name                       text not null,
    owner_name                          text,
    email                               text not null,
    phone                               text,
    website                             text,
    listing_url                         text,
    enquiry_type                        text not null,
    interested_package                  text,
    selected_trade_style                text,
    message                             text,
    website_build_details               jsonb,
    consent_given                       boolean not null default false,
    authorized_representative_confirmed boolean not null default false,
    status                              text not null default 'new'
                                          check (status in ('new', 'contacted', 'converted', 'rejected'))
);

create index if not exists business_enquiries_created_at_idx on public.business_enquiries (created_at desc);
create index if not exists business_enquiries_status_idx     on public.business_enquiries (status);
create index if not exists business_enquiries_region_idx     on public.business_enquiries (region);

alter table public.business_enquiries enable row level security;

-- No anon/authenticated policies are defined on purpose. Writes arrive only via
-- the edge function using the service-role key, which bypasses RLS; reads are
-- for admin/service contexts. Without this, enabling RLS with no policy would
-- still leave the table publicly readable through PostgREST if a policy were
-- later added carelessly - keep it closed by default.
comment on table public.business_enquiries is
    'Business claim/website enquiries. Written by the submit-business-enquiry edge function (service role only).';
