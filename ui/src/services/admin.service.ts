import { httpClient } from '../utils/httpClient';

const API_BASE_URL = '/helpdesk/v1';

export interface Product {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductEntity {
  id: string;
  productId: string;
  entityName: string;
  description: string;
  createdAt: string;
}

export interface ProductIssueType {
  id: string;
  productId: string;
  typeName: string;
  description: string;
  createdAt: string;
}

export const adminService = {
  // Products
  getProduct: (id: number) =>
    httpClient.get<{ product: Product }>(`${API_BASE_URL}/products/${id}`),

  listProducts: (page: number = 1, pageSize: number = 10) =>
    httpClient.get<{ products: Product[]; total: number }>(
      `${API_BASE_URL}/products?page=${page}&page_size=${pageSize}`
    ),

  createProduct: (data: Omit<Product, 'createdAt' | 'updatedAt'>) =>
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

  createProductEntity: (productId: number, data: Omit<ProductEntity, 'id' | 'createdAt'>) =>
    httpClient.post<{ entity: ProductEntity }>(
      `${API_BASE_URL}/products/${productId}/entities`,
      data
    ),

  deleteProductEntity: (id: number) =>
    httpClient.delete<{ success: boolean }>(`${API_BASE_URL}/entities/${id}`),

  // Product Issue Types
  listProductIssueTypes: (productId: number, page: number = 1, pageSize: number = 10) =>
    httpClient.get<{ issueTypes: ProductIssueType[] }>(
      `${API_BASE_URL}/products/${productId}/issue-types?page=${page}&page_size=${pageSize}`
    ),

  createProductIssueType: (productId: number, data: Omit<ProductIssueType, 'id' | 'createdAt'>) =>
    httpClient.post<{ issueType: ProductIssueType }>(
      `${API_BASE_URL}/products/${productId}/issue-types`,
      data
    ),

  deleteProductIssueType: (id: number) =>
    httpClient.delete<{ success: boolean }>(`${API_BASE_URL}/issue-types/${id}`),
};
