import { HttpClient } from '@gofreego/tsutils'

export { HttpClient, extractErrorMessage } from '@gofreego/tsutils'
export type { HttpClientConfig, RequestConfig, HttpResponse, HttpError, ErrorData } from '@gofreego/tsutils'

// ============ Configured Instance ============
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const httpClient = new HttpClient({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export default httpClient
