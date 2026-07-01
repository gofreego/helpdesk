package dao

type ProductIssueType struct {
	ID          int64
	ProductID   int64
	TypeName    string
	Description string
	CreatedAt   int64
}

func (pit *ProductIssueType) Scan(row interface {
	Scan(dest ...any) error
}) error {
	return row.Scan(&pit.ID, &pit.ProductID, &pit.TypeName, &pit.Description, &pit.CreatedAt)
}

func ToProtoProductIssueTypes(types []*ProductIssueType) []*ProductIssueType {
	if types == nil {
		return make([]*ProductIssueType, 0)
	}
	return types
}
