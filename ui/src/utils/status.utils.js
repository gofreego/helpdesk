import { ISSUE_STATUS_LABELS, ISSUE_STATUS_BADGE_CLASSES } from '../constants/issue.constants';

/**
 * Get status badge for an issue
 * @param {number} status - Status code
 * @returns {Object} Status label and badge class
 */
export const getIssueStatusBadge = (status) => {
  const text = ISSUE_STATUS_LABELS[status] || 'Unknown';
  const badgeClass = ISSUE_STATUS_BADGE_CLASSES[status] || 'badge-info';
  return { text, badgeClass };
};

/**
 * Get star rating display
 * @param {number} rating - Rating value
 * @param {number} maxRating - Maximum rating value
 * @returns {string} Star representation
 */
export const getStarRating = (rating, maxRating = 10) => {
  const stars = Math.round((rating / maxRating) * 5);
  return '⭐'.repeat(stars);
};
