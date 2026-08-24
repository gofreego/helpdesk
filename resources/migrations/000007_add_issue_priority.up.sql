-- Migration: 000007_add_issue_priority
-- Adds an optional priority to issues. 0=unset, 1=low, 2=medium, 3=high, 4=urgent

ALTER TABLE issues ADD COLUMN priority SMALLINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues (priority);
