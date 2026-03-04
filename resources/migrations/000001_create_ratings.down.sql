-- Rollback: 000001_create_ratings

DROP INDEX IF EXISTS idx_ratings_user_id;
DROP INDEX IF EXISTS idx_ratings_entity;
DROP INDEX IF EXISTS uq_ratings_user_entity;
DROP TABLE IF EXISTS ratings;
