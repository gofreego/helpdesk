package filter

import "github.com/gofreego/helpdesk/internal/constants"

type ProductFilter struct {
	ID       int64
	Name     string
	IsActive bool
	Page     int
	PageSize int
}

func (f *ProductFilter) WithDefaults() {
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

func (f *ProductFilter) Offset() int {
	return (f.Page - 1) * f.PageSize
}
