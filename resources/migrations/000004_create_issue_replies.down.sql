-- Rollback: 000004_create_issue_replies

DROP INDEX IF EXISTS idx_issue_replies_issue_id;
DROP TABLE IF EXISTS issue_replies;
