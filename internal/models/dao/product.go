package dao

type Product struct {
	ID          int64
	Name        string
	Description string
	IsActive    bool
	CreatedAt   int64
	UpdatedAt   int64
}

func (p *Product) Scan(row interface {
	Scan(dest ...any) error
}) error {
	return row.Scan(&p.ID, &p.Name, &p.Description, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
}

func ToProtoProducts(products []*Product) []*Product {
	if products == nil {
		return make([]*Product, 0)
	}
	return products
}
