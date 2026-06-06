-- Allow the quote notification Edge Function to require a shared secret.
-- Set app.quote_webhook_secret in the database to match QUOTE_WEBHOOK_SECRET in Supabase secrets.

create or replace function public.on_quote_inserted()
returns trigger as $$
declare
  webhook_secret text := current_setting('app.quote_webhook_secret', true);
begin
  perform net.http_post(
    url := 'https://xwqvhymkwuasotsgmarn.supabase.co/functions/v1/notify-quote',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', coalesce(webhook_secret, '')
    ),
    body := json_build_object('record', row_to_json(new))::text
  );
  return new;
end;
$$ language plpgsql security definer;
