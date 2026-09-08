package filter

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type IssueFilter struct {
	ID        string
	UserID    int32
	Entity    string
	EntityID  string
	Status    int // 0 means no filter, otherwise use status constants
	Priority  int // 0 means no filter, otherwise use priority constants
	Page      int
	PageSize  int
	IssueType string
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
		ID:        req.Id,
		UserID:    req.UserId,
		Entity:    req.Entity,
		EntityID:  req.EntityId,
		Status:    int(req.Status),
		Priority:  int(req.Priority),
		Page:      int(req.Page),
		PageSize:  int(req.PageSize),
		IssueType: req.IssueType,
	}
}

// MyIssuesFilter is used to list the authenticated user's issues for a product.
type MyIssuesFilter struct {
	UserID    int32
	ProductID int32
	Entity    string
	EntityID  string
	Limit     int
	Offset    int
}

func (f *MyIssuesFilter) WithDefaults() {
	if f.Limit <= 0 {
		f.Limit = constants.DefaultPageSize
	}
	if f.Limit > constants.MaxPageSize {
		f.Limit = constants.MaxPageSize
	}
	if f.Offset < 0 {
		f.Offset = 0
	}
}

// FromProtoListMyIssuesRequest converts proto request and the authenticated user's ID to a filter.
func FromProtoListMyIssuesRequest(userID int32, req *helpdesk_v1.ListMyIssuesRequest) *MyIssuesFilter {
	return &MyIssuesFilter{
		UserID:    userID,
		ProductID: req.ProductId,
		Entity:    req.Entity,
		EntityID:  req.EntityId,
		Limit:     int(req.Limit),
		Offset:    int(req.Offset),
	}
}
