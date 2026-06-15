-- Track email-validation results on outreach contacts (DNS/MX + optional mailbox).
ALTER TABLE public.email_contacts ADD COLUMN IF NOT EXISTS validation_status text;  -- valid_mx|no_mx|dead_domain|mailbox_invalid|verified|null(unchecked)
ALTER TABLE public.email_contacts ADD COLUMN IF NOT EXISTS validated_at timestamptz;
CREATE INDEX IF NOT EXISTS email_contacts_validation_idx ON public.email_contacts (validation_status);
