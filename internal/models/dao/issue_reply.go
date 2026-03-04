package dao

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type IssueReply struct {
	ID        string
	IssueID   string
	UserID    int32
	Role      constants.Role // 0: user, 1: admin
	Message   string
	IsDeleted bool
	CreatedAt int64 // Unix epoch milliseconds
}

func (r *IssueReply) Scan(row interface {
	Scan(dest ...interface{}) error
}) error {
	return row.Scan(&r.ID, &r.IssueID, &r.UserID, &r.Role, &r.Message, &r.IsDeleted, &r.CreatedAt)
}

// ToProto converts DAO IssueReply to proto IssueReply
func (r *IssueReply) ToProto() *helpdesk_v1.IssueReply {
	if r == nil {
		return nil
	}
	return &helpdesk_v1.IssueReply{
		Id:        r.ID,
		IssueId:   r.IssueID,
		UserId:    r.UserID,
		Role:      r.Role.String(),
		Message:   r.Message,
		IsDeleted: r.IsDeleted,
		CreatedAt: r.CreatedAt,
	}
}

// ToProtoList converts slice of DAO IssueReplies to proto IssueReplies
func ToProtoIssueReplies(replies []*IssueReply) []*helpdesk_v1.IssueReply {
	result := make([]*helpdesk_v1.IssueReply, 0, len(replies))
	for _, r := range replies {
		result = append(result, r.ToProto())
	}
	return result
}
