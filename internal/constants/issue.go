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
