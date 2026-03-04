package auth

import (
	"context"
	"errors"
	"strconv"
	"strings"

	"github.com/gofreego/helpdesk/internal/constants"
)

// Errors
var (
	ErrUnauthenticated   = errors.New("user not authenticated: missing x-user-id header")
	ErrForbidden         = errors.New("insufficient permissions")
	ErrCannotManageIssue = errors.New("you don't have permission to manage this issue")
)

// GetUserID extracts user ID from context as int32
func GetUserID(ctx context.Context) (int32, error) {
	userIDStr, ok := ctx.Value(constants.ContextKeyUserID).(string)
	if !ok || userIDStr == "" {
		return 0, ErrUnauthenticated
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 32)
	if err != nil {
		return 0, errors.New("invalid user id format: must be an integer")
	}

	return int32(userID), nil
}

// GetUserPermissions extracts user permissions from context
func GetUserPermissions(ctx context.Context) []string {
	permsStr, ok := ctx.Value(constants.ContextKeyUserPerms).(string)
	if !ok || permsStr == "" {
		return []string{}
	}

	// Permissions are comma-separated in the header
	perms := strings.Split(permsStr, ",")
	for i, p := range perms {
		perms[i] = strings.TrimSpace(p)
	}
	return perms
}

// HasPermission checks if user has a specific permission
func HasPermission(ctx context.Context, permission string) bool {
	perms := GetUserPermissions(ctx)
	for _, p := range perms {
		if p == constants.PermissionAdmin {
			return true
		}
		if p == permission {
			return true
		}
	}
	return false
}

// CanManageIssue checks if user can manage an issue
// Returns true if user is the issue creator OR has the permission to manage
func CanManageIssue(ctx context.Context, issueCreatorID int32) (bool, error) {
	userID, err := GetUserID(ctx)
	if err != nil {
		return false, err
	}

	// User created the issue
	if userID == issueCreatorID {
		return true, nil
	}

	// User has permission to manage any issue
	if HasPermission(ctx, constants.PermissionManageIssue) {
		return true, nil
	}

	return false, nil
}

// RequirePermission returns error if user doesn't have the permission
func RequirePermission(ctx context.Context, permission string) error {
	if !HasPermission(ctx, permission) {
		return ErrForbidden
	}
	return nil
}
