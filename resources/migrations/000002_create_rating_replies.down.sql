-- Rollback: 000002_create_rating_replies

DROP INDEX IF EXISTS idx_rating_replies_rating_id;
DROP TABLE IF EXISTS rating_replies;
