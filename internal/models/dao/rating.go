package dao

import "github.com/gofreego/helpdesk/api/helpdesk_v1"

type Rating struct {
	ID        string
	UserID    int32
	Type      string // entity type: "product", "order", "service", etc.
	EntityID  string
	Rating    float32
	Comment   string
	CreatedAt int64 // Unix epoch milliseconds
	UpdatedAt int64 // Unix epoch milliseconds
}

func (r *Rating) Scan(row interface {
	Scan(dest ...interface{}) error
}) error {
	return row.Scan(&r.ID, &r.UserID, &r.Type, &r.EntityID, &r.Rating, &r.Comment, &r.CreatedAt, &r.UpdatedAt)
}

// ToProto converts DAO Rating to proto Rating
func (r *Rating) ToProto() *helpdesk_v1.Rating {
	if r == nil {
		return nil
	}
	return &helpdesk_v1.Rating{
		Id:        r.ID,
		UserId:    r.UserID,
		Type:      r.Type,
		EntityId:  r.EntityID,
		Rating:    r.Rating,
		Comment:   r.Comment,
		CreatedAt: r.CreatedAt,
		UpdatedAt: r.UpdatedAt,
	}
}

// FromProtoRating converts proto Rating to DAO Rating
func FromProtoRating(p *helpdesk_v1.Rating) *Rating {
	if p == nil {
		return nil
	}
	return &Rating{
		ID:        p.Id,
		UserID:    p.UserId,
		Type:      p.Type,
		EntityID:  p.EntityId,
		Rating:    p.Rating,
		Comment:   p.Comment,
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
	}
}

// ToProtoList converts slice of DAO Ratings to proto Ratings
func ToProtoRatings(ratings []*Rating) []*helpdesk_v1.Rating {
	result := make([]*helpdesk_v1.Rating, 0, len(ratings))
	for _, r := range ratings {
		result = append(result, r.ToProto())
	}
	return result
}
