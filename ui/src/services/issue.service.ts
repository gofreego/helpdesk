/**
 * Issue Service
 * Handles all issue-related API calls
 */

import * as apiService from './api.service';
import {
  CreateIssueRequest,
  UpdateIssueRequest,
  UpdateIssueStatusRequest,
  CreateIssueReplyRequest,
  FetchIssuesRequest,
  FetchIssuesResponse,
  FetchIssueByIdResponse,
  FetchIssueRepliesResponse,
  CreateIssueResponse,
  UpdateIssueResponse,
  IssueConfig,
  transformFetchIssuesResponse,
  transformFetchIssueByIdResponse,
  transformFetchIssueRepliesResponse,
  transformCreateIssueResponse,
  transformUpdateIssueResponse,
  transformIssueConfig
} from '../models/issue.model';

/**
 * Fetch all issues with optional filters
 */
export const fetchIssues = async (
  filters?: FetchIssuesRequest | Record<string, any>
): Promise<FetchIssuesResponse> => {
  const request = filters instanceof FetchIssuesRequest
    ? filters
    : new FetchIssuesRequest(filters);

  const queryString = request.toQueryParams();
  const endpoint = queryString ? `/issues?${queryString}` : '/issues';

  const data = await apiService.get(endpoint);
  return transformFetchIssuesResponse(data);
};

/**
 * Fetch a single issue by ID
 */
export const fetchIssueById = async (issueId: string): Promise<FetchIssueByIdResponse> => {
  const data = await apiService.get(`/issues/${issueId}`);
  return transformFetchIssueByIdResponse(data);
};

/**
 * Fetch replies for an issue
 */
export const fetchIssueReplies = async (
  issueId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<FetchIssueRepliesResponse> => {
  const data = await apiService.get(
    `/issues/${issueId}/replies?page=${page}&page_size=${pageSize}`
  );
  return transformFetchIssueRepliesResponse(data);
};

/**
 * Create a new issue
 */
export const createIssue = async (
  issueData: CreateIssueRequest | Record<string, any>
): Promise<CreateIssueResponse> => {
  const request = issueData instanceof CreateIssueRequest
    ? issueData
    : new CreateIssueRequest(issueData as any);

  request.validate();

  const data = await apiService.post('/issues', request.toJSON());
  return transformCreateIssueResponse(data);
};

/**
 * Update an existing issue
 */
export const updateIssue = async (
  issueId: string,
  updates: UpdateIssueRequest | Record<string, any>
): Promise<UpdateIssueResponse> => {
  const request = updates instanceof UpdateIssueRequest
    ? updates
    : new UpdateIssueRequest(updates);

  const data = await apiService.put(`/issues/${issueId}`, request.toJSON());
  return transformUpdateIssueResponse(data);
};

/**
 * Update issue status
 */
export const updateIssueStatus = async (
  issueId: string,
  status: number
): Promise<UpdateIssueResponse> => {
  const request = new UpdateIssueStatusRequest({ status });
  request.validate();

  const data = await apiService.patch(`/issues/${issueId}/status`, request.toJSON());
  return transformUpdateIssueResponse(data);
};

/**
 * Delete an issue
 */
export const deleteIssue = async (issueId: string): Promise<void> => {
  await apiService.del(`/issues/${issueId}`);
};

/**
 * Add a reply to an issue
 */
export const createIssueReply = async (
  issueId: string,
  replyData: CreateIssueReplyRequest | Record<string, any>
): Promise<any> => {
  const request = replyData instanceof CreateIssueReplyRequest
    ? replyData
    : new CreateIssueReplyRequest(replyData as any);

  request.validate();

  return await apiService.post(`/issues/${issueId}/replies`, request.toJSON());
};

/**
 * Delete an issue reply
 */
export const deleteIssueReply = async (replyId: string): Promise<void> => {
  await apiService.del(`/issue-replies/${replyId}`);
};

/**
 * Get issue config (types, etc.)
 */
export const getIssueConfig = async (): Promise<IssueConfig> => {
  const data = await apiService.get('/issue-config');
  return transformIssueConfig(data);
};

// Alias for backward compatibility
export const fetchIssueConfig = getIssueConfig;
