/**
 * API Service
 * Centralized HTTP client for all backend API calls
 * Manages headers, request/response transformations
 */

import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

const API_BASE_URL = '/helpdesk/v1';

/**
 * Set authentication headers in session storage
 */
export const setAuthHeaders = (userId: string | number, permissions: string[]): void => {
  sessionStorage.setItem('user_id', String(userId));
  sessionStorage.setItem('user_perms', permissions.join(','));
};

/**
 * Get headers for API requests
 * Automatically manages x-user-id and x-user-perms from session storage
 */
const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Get user info from sessionStorage
  const userId = sessionStorage.getItem('user_id');
  const userPerms = sessionStorage.getItem('user_perms');

  if (userId) {
    headers['x-user-id'] = userId;
  }
  if (userPerms) {
    headers['x-user-perms'] = userPerms;
  }

  return headers;
};

/**
 * Generic request handler
 */
const request = async <T = any>(
  method: Method,
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      headers: { ...getHeaders(), ...config?.headers },
      ...config
    });
    return response.data;
  } catch (error: any) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error.response?.data || error;
  }
};

/**
 * GET request
 */
export const get = <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request<T>('GET', endpoint, undefined, config);
};

/**
 * POST request
 */
export const post = <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request<T>('POST', endpoint, data, config);
};

/**
 * PUT request
 */
export const put = <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request<T>('PUT', endpoint, data, config);
};

/**
 * PATCH request
 */
export const patch = <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return request<T>('PATCH', endpoint, data, config);
};

/**
 * DELETE request
 */
export const del = <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
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
