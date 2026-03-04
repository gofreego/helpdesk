package filter

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type RatingFilter struct {
	ID       string
	UserID   int32
	Type     string
	EntityID string
	Page     int
	PageSize int
}

func (f *RatingFilter) WithDefaults() {
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

func (f *RatingFilter) Offset() int {
	return (f.Page - 1) * f.PageSize
}

// FromProtoListRatingsRequest converts proto request to filter
func FromProtoListRatingsRequest(req *helpdesk_v1.ListRatingsRequest) *RatingFilter {
	if req == nil {
		return &RatingFilter{}
	}
	return &RatingFilter{
		ID:       req.Id,
		UserID:   req.UserId,
		Type:     req.Type,
		EntityID: req.EntityId,
		Page:     int(req.Page),
		PageSize: int(req.PageSize),
	}
}
