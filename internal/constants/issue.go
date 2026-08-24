package constants

type IssueStatus int

const (
	Open IssueStatus = iota + 1
	InProgress
	Resolved
	Closed
)

func (s IssueStatus) String() string {
	switch s {
	case Open:
		return "open"
	case InProgress:
		return "in_progress"
	case Resolved:
		return "resolved"
	case Closed:
		return "closed"
	default:
		return "open"
	}
}

// IssuePriority represents an issue's priority. Zero value means unset/no priority.
type IssuePriority int

const (
	PriorityLow IssuePriority = iota + 1
	PriorityMedium
	PriorityHigh
	PriorityUrgent
)

func (p IssuePriority) String() string {
	switch p {
	case PriorityLow:
		return "low"
	case PriorityMedium:
		return "medium"
	case PriorityHigh:
		return "high"
	case PriorityUrgent:
		return "urgent"
	default:
		return "unset"
	}
}
