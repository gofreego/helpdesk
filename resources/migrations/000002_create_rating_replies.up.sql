-- Migration: 000002_create_rating_replies
-- Stores replies to ratings (e.g. an admin acknowledging a poor rating).
-- A rating can receive multiple replies but typically only one (from the admin/owner).

CREATE TABLE IF NOT EXISTS rating_replies (
    id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    rating_id   UUID             NOT NULL,
    user_id     BIGINT           NOT NULL,
    role        INTEGER          NOT NULL,
    message     TEXT             NOT NULL,
    is_deleted  BOOLEAN          NOT NULL DEFAULT FALSE,
    created_at  BIGINT           NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_rating_replies_rating_id ON rating_replies (rating_id);
