-- Migration Down: 000006_change_rating_to_float
-- Reverts the rating column type back to SMALLINT.

ALTER TABLE ratings ALTER COLUMN rating TYPE SMALLINT;
