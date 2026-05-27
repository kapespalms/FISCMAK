-- Schedule monthly reset of free-tier message credits via pg_cron when available.
-- Function: reset_monthly_message_balance() (see 20260527b_message_balance_monthly_reset.sql).
-- Cron: 05:00 UTC on the 1st of each month (5 0 1 * *).
--
-- If pg_cron is not enabled (extension missing or not on Pro), this migration no-ops.
-- Manual fallback (Supabase Dashboard → Database → Cron, or SQL Editor after enabling pg_cron):
--   SELECT cron.schedule(
--     'fiscmak-reset-message-balance',
--     '5 0 1 * *',
--     $$SELECT reset_monthly_message_balance();$$
--   );

DO $do$
DECLARE
  existing_job_id bigint;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron extension not installed; skip scheduling fiscmak-reset-message-balance. Use Dashboard cron or run cron.schedule manually.';
    RETURN;
  END IF;

  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'fiscmak-reset-message-balance'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'fiscmak-reset-message-balance',
    '5 0 1 * *',
    $cmd$SELECT reset_monthly_message_balance();$cmd$
  );
END;
$do$;
