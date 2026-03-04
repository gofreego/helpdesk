-- Migration: 000006_change_rating_to_float
-- Changes the rating column type from SMALLINT to NUMERIC(3,1) to support fractional ratings like 2.5.

ALTER TABLE ratings ALTER COLUMN rating TYPE NUMERIC(3,1);
