-- Monthly reset of free-tier message credits (25 = FREE_MESSAGE_LIMIT).
-- Project does not use pg_cron yet; schedule via Supabase Dashboard cron, external job, or:
--   SELECT cron.schedule(
--     'fiscmak-reset-message-balance',
--     '5 0 1 * *',
--     $$SELECT reset_monthly_message_balance();$$
--   );
-- Requires pg_cron extension (Supabase Pro).

CREATE OR REPLACE FUNCTION reset_monthly_message_balance()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE app_users
  SET message_balance = 25
  WHERE message_balance IS NOT NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION reset_monthly_message_balance() IS
  'Resets app_users.message_balance to 25 for free-tier rows (non-null balance). Run on 1st of month.';
