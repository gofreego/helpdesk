package filter

import "github.com/gofreego/helpdesk/internal/constants"

type ProductEntityFilter struct {
	ProductID  int64
	EntityName string
	Page       int
	PageSize   int
}

func (f *ProductEntityFilter) WithDefaults() {
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

func (f *ProductEntityFilter) Offset() int {
	return (f.Page - 1) * f.PageSize
}
