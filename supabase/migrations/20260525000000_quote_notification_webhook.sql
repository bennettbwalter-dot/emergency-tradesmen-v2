-- Setup Database Webhook for Quote Notifications using pg_net
-- This trigger automatically sends an asynchronous POST request to our notify-quote Edge Function
-- whenever a new row is inserted into the public.quotes table.

-- Create trigger function that makes the HTTP request
CREATE OR REPLACE FUNCTION public.on_quote_inserted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://xwqvhymkwuasotsgmarn.supabase.co/functions/v1/notify-quote',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object('record', row_to_json(NEW))::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the quotes table
DROP TRIGGER IF EXISTS send_quote_notification ON public.quotes;

CREATE TRIGGER send_quote_notification
AFTER INSERT ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.on_quote_inserted();

COMMENT ON TRIGGER send_quote_notification ON public.quotes IS 'Automatically notifies business and customer via Resend edge function on new quote inserts.';
