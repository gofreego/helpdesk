package filter

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type RatingReplyFilter struct {
	RatingID string
	Page     int
	PageSize int
}

func (f *RatingReplyFilter) WithDefaults() {
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

func (f *RatingReplyFilter) Offset() int {
	return (f.Page - 1) * f.PageSize
}

// FromProtoListRatingRepliesRequest converts proto request to filter
func FromProtoListRatingRepliesRequest(req *helpdesk_v1.ListRatingRepliesRequest) *RatingReplyFilter {
	if req == nil {
		return &RatingReplyFilter{}
	}
	return &RatingReplyFilter{
		RatingID: req.RatingId,
		Page:     int(req.Page),
		PageSize: int(req.PageSize),
	}
}
