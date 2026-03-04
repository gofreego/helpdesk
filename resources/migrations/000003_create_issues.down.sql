-- Rollback: 000003_create_issues

DROP INDEX IF EXISTS idx_issues_status;
DROP INDEX IF EXISTS idx_issues_user_id;
DROP INDEX IF EXISTS idx_issues_entity;
DROP TABLE IF EXISTS issues;
