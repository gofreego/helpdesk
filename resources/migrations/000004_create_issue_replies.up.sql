-- Migration: 000004_create_issue_replies
-- Stores the threaded conversation between users and admins on an issue.
-- Replies are ordered by created_at to reconstruct the conversation.
-- Conversation continues across status changes until the issue is closed.

CREATE TABLE IF NOT EXISTS issue_replies (
    id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id    UUID             NOT NULL,
    user_id     BIGINT           NOT NULL,
    role        INTEGER          NOT NULL,
    message     TEXT             NOT NULL,
    is_deleted  BOOLEAN          NOT NULL DEFAULT FALSE,
    created_at  BIGINT           NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_issue_replies_issue_id ON issue_replies (issue_id, created_at);
