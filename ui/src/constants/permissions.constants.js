// Permission constants
export const PERMISSIONS = {
  ADMIN: 'admin',
  ISSUE_REPLY: 'issue:reply',
  RATING_REPLY: 'rating:reply',
  ISSUE_UPDATE_STATUS: 'issue:update:status',
  DELETE_ANY: 'delete:any'
};

// Helper function to check if user has permission
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false;
  const perms = Array.isArray(userPermissions) ? userPermissions : userPermissions.split(',');
  return perms.includes(requiredPermission) || perms.includes(PERMISSIONS.ADMIN);
};
