package constants

// User permissions
const (
	PermissionManageIssue  = "issue:manage"
	PermissionManageRating = "rating:manage"
	PermissionDeleteAny    = "delete:any"
	PermissionAdmin        = "admin"
)

// Context keys
const (
	ContextKeyUserID    = "user_id"
	ContextKeyUserPerms = "user_perms"
)

// Headers
const (
	HeaderUserID    = "x-user-id"
	HeaderUserPerms = "x-user-perms"
)
