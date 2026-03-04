-- Migration: 000001_create_ratings
-- Creates the ratings table.
-- Users can rate any entity identified by (type, entity_id).
-- The `rating` value is validated by the application against the configured
-- Ratings.MaxScale value (e.g. 1-5 or 1-10).

CREATE TABLE IF NOT EXISTS ratings (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     BIGINT      NOT NULL,
    product_id  BIGINT      NOT NULL,
    entity      VARCHAR(20) NOT NULL,
    entity_id   TEXT        NOT NULL,           -- ID of the entity being rated
    rating      NUMERIC(3,1) NOT NULL CHECK (rating >= 1),
    comment     TEXT,
    created_at  BIGINT      NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    updated_at  BIGINT      NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- One user can rate the same entity only once
CREATE UNIQUE INDEX IF NOT EXISTS uq_ratings_user_entity
    ON ratings (product_id, user_id, entity, entity_id);

-- Common query patterns
CREATE INDEX IF NOT EXISTS idx_ratings_entity  ON ratings (product_id, entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings (product_id, user_id);
