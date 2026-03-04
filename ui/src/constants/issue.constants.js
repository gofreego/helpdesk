// Issue status constants
export const ISSUE_STATUS = {
  OPEN: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  CLOSED: 4
};

// Issue status labels
export const ISSUE_STATUS_LABELS = {
  [ISSUE_STATUS.OPEN]: 'Open',
  [ISSUE_STATUS.IN_PROGRESS]: 'In Progress',
  [ISSUE_STATUS.RESOLVED]: 'Resolved',
  [ISSUE_STATUS.CLOSED]: 'Closed'
};

// Issue status badge classes
export const ISSUE_STATUS_BADGE_CLASSES = {
  [ISSUE_STATUS.OPEN]: 'badge-danger',
  [ISSUE_STATUS.IN_PROGRESS]: 'badge-warning',
  [ISSUE_STATUS.RESOLVED]: 'badge-success',
  [ISSUE_STATUS.CLOSED]: 'badge-info'
};
