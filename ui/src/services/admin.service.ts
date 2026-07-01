import { httpClient } from '../utils/httpClient';

const API_BASE_URL = '/helpdesk/v1';

export interface Product {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface ProductEntity {
  id: number;
  product_id: number;
  entity_name: string;
  description: string;
  created_at: number;
}

export interface ProductIssueType {
  id: number;
  product_id: number;
  type_name: string;
  description: string;
  created_at: number;
}

export const adminService = {
  // Products
  getProduct: (id: number) =>
    httpClient.get<{ product: Product }>(`${API_BASE_URL}/products/${id}`),

  listProducts: (page: number = 1, pageSize: number = 10) =>
    httpClient.get<{ products: Product[]; total: number }>(
      `${API_BASE_URL}/products?page=${page}&page_size=${pageSize}`
    ),

  createProduct: (data: Omit<Product, 'created_at' | 'updated_at'>) =>
    httpClient.post<{ product: Product }>(`${API_BASE_URL}/products`, data),

  updateProduct: (id: number, data: Partial<Product>) =>
    httpClient.put<{ product: Product }>(`${API_BASE_URL}/products/${id}`, data),

  deleteProduct: (id: number) =>
    httpClient.delete<{ success: boolean }>(`${API_BASE_URL}/products/${id}`),

  // Product Entities
  listProductEntities: (productId: number, page: number = 1, pageSize: number = 10) =>
    httpClient.get<{ entities: ProductEntity[] }>(
      `${API_BASE_URL}/products/${productId}/entities?page=${page}&page_size=${pageSize}`
    ),

  createProductEntity: (productId: number, data: Omit<ProductEntity, 'id' | 'created_at'>) =>
    httpClient.post<{ entity: ProductEntity }>(
      `${API_BASE_URL}/products/${productId}/entities`,
      data
    ),

  deleteProductEntity: (id: number) =>
    httpClient.delete<{ success: boolean }>(`${API_BASE_URL}/entities/${id}`),

  // Product Issue Types
  listProductIssueTypes: (productId: number, page: number = 1, pageSize: number = 10) =>
    httpClient.get<{ issue_types: ProductIssueType[] }>(
      `${API_BASE_URL}/products/${productId}/issue-types?page=${page}&page_size=${pageSize}`
    ),

  createProductIssueType: (productId: number, data: Omit<ProductIssueType, 'id' | 'created_at'>) =>
    httpClient.post<{ issue_type: ProductIssueType }>(
      `${API_BASE_URL}/products/${productId}/issue-types`,
      data
    ),

  deleteProductIssueType: (id: number) =>
    httpClient.delete<{ success: boolean }>(`${API_BASE_URL}/issue-types/${id}`),
};
