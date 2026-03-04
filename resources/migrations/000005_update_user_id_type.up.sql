-- Migration: 000005_update_user_id_type
-- Updates user_id from TEXT to BIGINT in all tables.

ALTER TABLE ratings
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE rating_replies
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE issues
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE issue_replies
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;
