-- Phase 1 trust-layer verification.
-- Read-only checks: does not insert, update, delete, or create data.

select
    'trust tables' as check_name,
    table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
      'business_field_evidence',
      'registry_verifications',
      'business_claims',
      'enrichment_runs'
  )
order by table_name;

select
    'business trust columns' as check_name,
    column_name,
    data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'businesses'
  and column_name in ('trust_score', 'trust_badges', 'claim_status')
order by column_name;

select
    'public safe views' as check_name,
    table_name,
    column_name
from information_schema.columns
where table_schema = 'public'
  and table_name in ('public_business_field_evidence', 'public_registry_verifications')
order by table_name, ordinal_position;

select
    'rls enabled' as check_name,
    relname as table_name,
    relrowsecurity as rls_enabled
from pg_class
where relname in (
    'business_field_evidence',
    'registry_verifications',
    'business_claims',
    'enrichment_runs'
)
order by relname;

select
    'trust policies' as check_name,
    tablename,
    policyname,
    cmd,
    roles
from pg_policies
where schemaname = 'public'
  and tablename in (
      'business_field_evidence',
      'registry_verifications',
      'business_claims',
      'enrichment_runs'
  )
order by tablename, policyname;

select
    'region constraints' as check_name,
    format('%I.%I', ns.nspname, cls.relname) as table_name,
    conname,
    pg_get_constraintdef(oid) as definition
from pg_constraint
join pg_class cls on cls.oid = pg_constraint.conrelid
join pg_namespace ns on ns.oid = cls.relnamespace
where ns.nspname = 'public'
  and cls.relname in (
      'business_field_evidence',
      'registry_verifications',
      'business_claims',
      'enrichment_runs'
  )
  and pg_get_constraintdef(oid) ilike '%region%'
order by table_name, conname;
