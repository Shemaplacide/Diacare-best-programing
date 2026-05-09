-- ============================================================
--  DiaCare — Clear all data (keeps schema, resets sequences)
--  Run against your PostgreSQL database:
--    psql -U <user> -d <dbname> -f clear-db.sql
-- ============================================================

BEGIN;

-- Disable FK checks temporarily
SET session_replication_role = replica;

TRUNCATE TABLE
    notifications,
    prescriptions,
    glucose_readings,
    health_metrics,
    appointments,
    admins,
    doctors,
    patients,
    users
RESTART IDENTITY CASCADE;

-- Re-enable FK checks
SET session_replication_role = DEFAULT;

COMMIT;

-- Verify
SELECT
    'users'           AS tbl, COUNT(*) FROM users           UNION ALL
SELECT 'patients',          COUNT(*) FROM patients          UNION ALL
SELECT 'doctors',           COUNT(*) FROM doctors           UNION ALL
SELECT 'admins',            COUNT(*) FROM admins            UNION ALL
SELECT 'appointments',      COUNT(*) FROM appointments      UNION ALL
SELECT 'prescriptions',     COUNT(*) FROM prescriptions     UNION ALL
SELECT 'glucose_readings',  COUNT(*) FROM glucose_readings  UNION ALL
SELECT 'health_metrics',    COUNT(*) FROM health_metrics    UNION ALL
SELECT 'notifications',     COUNT(*) FROM notifications;
