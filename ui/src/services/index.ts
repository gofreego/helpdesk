import httpClient from '../utils/httpClient'
import { AuthService, SessionManager } from '@gofreego/tsutils'

export const sessionManager = SessionManager.getInstance(httpClient)
export const authService = AuthService.getInstance(httpClient)

// Export all services
export * from './issue.service';
export * from './rating.service';
export * from './admin.service';
