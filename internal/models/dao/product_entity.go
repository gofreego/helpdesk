package dao

type ProductEntity struct {
	ID          int64
	ProductID   int64
	EntityName  string
	Description string
	CreatedAt   int64
}

func (pe *ProductEntity) Scan(row interface {
	Scan(dest ...any) error
}) error {
	return row.Scan(&pe.ID, &pe.ProductID, &pe.EntityName, &pe.Description, &pe.CreatedAt)
}

func ToProtoProductEntities(entities []*ProductEntity) []*ProductEntity {
	if entities == nil {
		return make([]*ProductEntity, 0)
	}
	return entities
}
