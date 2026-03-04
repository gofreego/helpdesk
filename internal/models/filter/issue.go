package filter

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type IssueFilter struct {
	ID       string
	UserID   int32
	Entity   string
	EntityID string
	Status   int // 0 means no filter, otherwise use status constants
	Page     int
	PageSize int
}

func (f *IssueFilter) WithDefaults() {
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

func (f *IssueFilter) Offset() int {
	return (f.Page - 1) * f.PageSize
}

// FromProtoListIssuesRequest converts proto request to filter
func FromProtoListIssuesRequest(req *helpdesk_v1.ListIssuesRequest) *IssueFilter {
	if req == nil {
		return &IssueFilter{}
	}
	return &IssueFilter{
		ID:       req.Id,
		UserID:   req.UserId,
		Entity:   req.Entity,
		EntityID: req.EntityId,
		Status:   int(req.Status),
		Page:     int(req.Page),
		PageSize: int(req.PageSize),
	}
}
