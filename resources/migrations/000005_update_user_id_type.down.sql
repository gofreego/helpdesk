-- Migration: 000005_update_user_id_type
-- Reverts user_id from BIGINT to TEXT in all tables.

ALTER TABLE ratings
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE rating_replies
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE issues
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE issue_replies
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
