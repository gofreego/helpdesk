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
	ContextKeyUserID     = "user_id"
	ContextKeyUserPerms  = "user_perms"
	ContextKeyProfileID  = "profile_id"
	ContextKeyProfileIDs = "profile_ids"
)

// Headers
const (
	HeaderUserID     = "x-user-id"
	HeaderUserPerms  = "x-user-perms"
	HeaderProfileID  = "x-profile-id"  // client-supplied active profile; must be validated against HeaderProfileIDs
	HeaderProfileIDs = "x-profile-ids" // gateway-derived (from JWT) comma-separated list of profiles authorized for the caller
)
