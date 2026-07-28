-- Resume approved publications after a platform account becomes connected.
-- Creator-assisted accounts remain held until their publishing mode changes.

CREATE OR REPLACE FUNCTION public.requeue_social_publications_after_connection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.enabled
     AND NEW.connection_status = 'connected'
     AND NEW.publishing_mode <> 'creator_assisted'
     AND (
       OLD.connection_status IS DISTINCT FROM NEW.connection_status
       OR OLD.publishing_mode IS DISTINCT FROM NEW.publishing_mode
     ) THEN
    WITH requeued AS (
      UPDATE public.social_publications AS publication
      SET
        status = 'scheduled',
        last_error = NULL,
        updated_at = timezone('utc', now())
      FROM public.social_campaigns AS campaign
      WHERE publication.account_id = NEW.id
        AND publication.campaign_id = campaign.id
        AND publication.status = 'creator_action_required'
        AND campaign.approved_at IS NOT NULL
      RETURNING publication.campaign_id
    )
    UPDATE public.social_campaigns AS campaign
    SET
      state = 'scheduled',
      last_error = NULL,
      updated_at = timezone('utc', now())
    WHERE campaign.id IN (SELECT campaign_id FROM requeued);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS requeue_social_publications_on_connection
  ON public.social_accounts;
CREATE TRIGGER requeue_social_publications_on_connection
AFTER UPDATE OF connection_status, publishing_mode
ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.requeue_social_publications_after_connection();
