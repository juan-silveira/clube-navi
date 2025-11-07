-- Migration: Rename all club references to club
-- This migration renames tables and columns from club to club terminology

-- Rename tables
ALTER TABLE IF EXISTS clubs RENAME TO clubs;
ALTER TABLE IF EXISTS club_brandings RENAME TO club_brandings;
ALTER TABLE IF EXISTS club_modules RENAME TO club_modules;
ALTER TABLE IF EXISTS club_stats RENAME TO club_stats;
ALTER TABLE IF EXISTS club_cashback_configs RENAME TO club_cashback_configs;
ALTER TABLE IF EXISTS club_withdrawal_configs RENAME TO club_withdrawal_configs;
ALTER TABLE IF EXISTS club_admins RENAME TO club_admins;
ALTER TABLE IF EXISTS club_api_keys RENAME TO club_api_keys;
ALTER TABLE IF EXISTS club_usage_stats RENAME TO club_usage_stats;

-- Rename foreign key columns
ALTER TABLE IF EXISTS club_brandings RENAME COLUMN club_id TO club_id;
ALTER TABLE IF EXISTS club_modules RENAME COLUMN club_id TO club_id;
ALTER TABLE IF EXISTS club_stats RENAME COLUMN club_id TO club_id;
ALTER TABLE IF EXISTS club_cashback_configs RENAME COLUMN club_id TO club_id;
ALTER TABLE IF EXISTS club_withdrawal_configs RENAME COLUMN club_id TO club_id;
ALTER TABLE IF EXISTS club_admins RENAME COLUMN club_id TO club_id;
ALTER TABLE IF EXISTS club_api_keys RENAME COLUMN club_id TO club_id;
ALTER TABLE IF EXISTS club_usage_stats RENAME COLUMN club_id TO club_id;

-- Rename indexes
ALTER INDEX IF EXISTS idx_clubs_subscription_status RENAME TO idx_clubs_subscription_status;

-- Rename global_stats columns
ALTER TABLE IF EXISTS global_stats RENAME COLUMN total_clubs TO total_clubs;
ALTER TABLE IF EXISTS global_stats RENAME COLUMN new_clubs TO new_clubs;
ALTER TABLE IF EXISTS global_stats RENAME COLUMN churned_clubs TO churned_clubs;

-- Rename enum type
ALTER TYPE "TenantStatus" RENAME TO "ClubStatus";

-- Update sequences if they exist
DO $$
BEGIN
  -- This will rename sequences if they follow the pattern club_*
  EXECUTE (
    SELECT string_agg(
      'ALTER SEQUENCE IF EXISTS ' || quote_ident(sequence_name) || ' RENAME TO ' ||
      quote_ident(replace(sequence_name, 'club_', 'club_')),
      '; '
    )
    FROM information_schema.sequences
    WHERE sequence_schema = 'public' AND sequence_name LIKE '%club%'
  );
END $$;

-- Update constraint names
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT conname, conrelid::regclass AS table_name
    FROM pg_constraint
    WHERE conname LIKE '%club%'
  LOOP
    EXECUTE format(
      'ALTER TABLE %s RENAME CONSTRAINT %I TO %I',
      constraint_record.table_name,
      constraint_record.conname,
      replace(constraint_record.conname, 'club', 'club')
    );
  END LOOP;
END $$;
