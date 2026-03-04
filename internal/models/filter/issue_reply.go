package filter

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type IssueReplyFilter struct {
	IssueID  string
	Page     int
	PageSize int
}

func (f *IssueReplyFilter) WithDefaults() {
	if f.Page <= 0 {
		f.Page = 1
	}
	if f.PageSize <= 0 {
		f.PageSize = constants.DefaultPageSize
	}
	if f.PageSize > constants.MaxPageSize {
		f.PageSize = constants.MaxPageSize
	}
}

func (f *IssueReplyFilter) Offset() int {
	return (f.Page - 1) * f.PageSize
}

// FromProtoListIssueRepliesRequest converts proto request to filter
func FromProtoListIssueRepliesRequest(req *helpdesk_v1.ListIssueRepliesRequest) *IssueReplyFilter {
	if req == nil {
		return &IssueReplyFilter{}
	}
	return &IssueReplyFilter{
		IssueID:  req.IssueId,
		Page:     int(req.Page),
		PageSize: int(req.PageSize),
	}
}
