package dao

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type RatingReply struct {
	ID        string
	RatingID  string
	UserID    int32
	Role      constants.Role // 0: user, 1: admin
	Message   string
	IsDeleted bool
	CreatedAt int64 // Unix epoch milliseconds
}

func (r *RatingReply) Scan(row interface {
	Scan(dest ...interface{}) error
}) error {
	return row.Scan(&r.ID, &r.RatingID, &r.UserID, &r.Role, &r.Message, &r.IsDeleted, &r.CreatedAt)
}

// ToProto converts DAO RatingReply to proto RatingReply
func (r *RatingReply) ToProto() *helpdesk_v1.RatingReply {
	if r == nil {
		return nil
	}
	return &helpdesk_v1.RatingReply{
		Id:        r.ID,
		RatingId:  r.RatingID,
		UserId:    r.UserID,
		Role:      r.Role.String(),
		Message:   r.Message,
		IsDeleted: r.IsDeleted,
		CreatedAt: r.CreatedAt,
	}
}

// ToProtoList converts slice of DAO RatingReplies to proto RatingReplies
func ToProtoRatingReplies(replies []*RatingReply) []*helpdesk_v1.RatingReply {
	result := make([]*helpdesk_v1.RatingReply, 0, len(replies))
	for _, r := range replies {
		result = append(result, r.ToProto())
	}
	return result
}
