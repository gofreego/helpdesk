/**
 * API Service
 * Centralized HTTP client for all backend API calls
 * Manages headers, request/response transformations
 */

import { httpClient } from '../utils/httpClient';
import { RequestConfig } from '@gofreego/tsutils';

const API_BASE_URL = '/helpdesk/v1';

/**
 * Generic request handler
 */
const request = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    let response;
    switch (method) {
      case 'GET':
        response = await httpClient.get<T>(url, config);
        break;
      case 'POST':
        response = await httpClient.post<T>(url, data, config);
        break;
      case 'PUT':
        response = await httpClient.put<T>(url, data, config);
        break;
      case 'PATCH':
        response = await httpClient.patch<T>(url, data, config);
        break;
      case 'DELETE':
        response = await httpClient.delete<T>(url, config);
        break;
    }
    return response.data;
  } catch (error: any) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error.data || error;
  }
};

/**
 * GET request
 */
export const get = <T = any>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> => {
  return request<T>('GET', endpoint, undefined, config);
};

/**
 * POST request
 */
export const post = <T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return request<T>('POST', endpoint, data, config);
};

/**
 * PUT request
 */
export const put = <T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return request<T>('PUT', endpoint, data, config);
};

/**
 * PATCH request
 */
export const patch = <T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return request<T>('PATCH', endpoint, data, config);
};

/**
 * DELETE request
 */
export const del = <T = any>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> => {
  return request<T>('DELETE', endpoint, undefined, config);
};

export default {
  get,
  post,
  put,
  patch,
  delete: del
};
