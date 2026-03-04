-- Migration: 000003_create_issues
-- Stores helpdesk issues reported by users against any entity.
-- Status lifecycle: 1=open, 2=in_progress, 3=resolved, 4=closed

CREATE TABLE IF NOT EXISTS issues (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     BIGINT         NOT NULL,
    product_id  BIGINT         NOT NULL,
    entity      VARCHAR(20)    NOT NULL,
    entity_id   TEXT         NOT NULL,           -- ID of the entity the issue is about
    title       TEXT         NOT NULL,
    description TEXT         NOT NULL,
    status      INTEGER      NOT NULL DEFAULT 1, -- 1=open, 2=in_progress, 3=resolved, 4=closed
    created_at  BIGINT       NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    updated_at  BIGINT       NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Common query patterns
CREATE INDEX IF NOT EXISTS idx_issues_entity    ON issues (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_issues_user_id   ON issues (user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status    ON issues (status);
