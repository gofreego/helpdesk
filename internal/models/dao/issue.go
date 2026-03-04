package dao

import (
	"github.com/gofreego/helpdesk/api/helpdesk_v1"
	"github.com/gofreego/helpdesk/internal/constants"
)

type Issue struct {
	ID          string
	UserID      int32
	ProductID   int32
	Entity      string
	EntityID    string
	Title       string
	Description string
	Status      constants.IssueStatus // 1=open, 2=in_progress, 3=resolved, 4=closed
	CreatedAt   int64                 // Unix epoch milliseconds
	UpdatedAt   int64                 // Unix epoch milliseconds
	IssueType   string
}

func (i *Issue) Scan(row interface {
	Scan(dest ...interface{}) error
}) error {
	return row.Scan(&i.ID, &i.UserID, &i.ProductID, &i.Entity, &i.EntityID, &i.Title, &i.Description, &i.Status, &i.CreatedAt, &i.UpdatedAt, &i.IssueType)
}

// ToProto converts DAO Issue to proto Issue
func (i *Issue) ToProto() *helpdesk_v1.Issue {
	if i == nil {
		return nil
	}
	return &helpdesk_v1.Issue{
		Id:          i.ID,
		UserId:      i.UserID,
		ProductId:   i.ProductID,
		Entity:      i.Entity,
		EntityId:    i.EntityID,
		Title:       i.Title,
		Description: i.Description,
		Status:      int32(i.Status),
		CreatedAt:   i.CreatedAt,
		UpdatedAt:   i.UpdatedAt,
		IssueType:   i.IssueType,
	}
}

// FromProtoIssue converts proto Issue to DAO Issue
func FromProtoIssue(p *helpdesk_v1.Issue) *Issue {
	if p == nil {
		return nil
	}
	return &Issue{
		ID:          p.Id,
		UserID:      p.UserId,
		ProductID:   p.ProductId,
		Entity:      p.Entity,
		EntityID:    p.EntityId,
		Title:       p.Title,
		Description: p.Description,
		Status:      constants.IssueStatus(p.Status),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		IssueType:   p.IssueType,
	}
}

// ToProtoList converts slice of DAO Issues to proto Issues
func ToProtoIssues(issues []*Issue) []*helpdesk_v1.Issue {
	result := make([]*helpdesk_v1.Issue, 0, len(issues))
	for _, i := range issues {
		result = append(result, i.ToProto())
	}
	return result
}
