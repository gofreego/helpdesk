package constants

type Role int

const (
	RoleUser Role = iota + 1
	RoleAdmin
)

func RoleFromString(s string) Role {
	switch s {
	case "admin":
		return RoleAdmin
	default:
		return RoleUser
	}
}

func (r Role) String() string {
	switch r {
	case RoleUser:
		return "user"
	case RoleAdmin:
		return "admin"
	default:
		return "user"
	}
}
