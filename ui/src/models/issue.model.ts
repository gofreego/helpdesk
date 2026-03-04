/**
 * Issue Models
 * TypeScript interfaces and types for Issue-related operations
 */

// ============================================
// Base Interfaces
// ============================================

export interface Issue {
  id: string;
  type: string;
  entity_id: string;
  user_id: string;
  title: string;
  description: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface IssueReply {
  id: string;
  issue_id: string;
  user_id: string;
  message: string;
  created_at?: string;
  updated_at?: string;
}

export interface IssueConfig {
  types: string[];
}

// ============================================
// Request Types
// ============================================

export interface CreateIssueRequestData {
  type: string;
  entity_id: string;
  title: string;
  description: string;
}

export interface UpdateIssueRequestData {
  title?: string;
  description?: string;
  status?: number;
}

export interface UpdateIssueStatusRequestData {
  status: number;
}

export interface CreateIssueReplyRequestData {
  message: string;
}

export interface FetchIssuesFilters {
  type?: string;
  entity_id?: string;
  user_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

// ============================================
// Response Types
// ============================================

export interface FetchIssuesResponse {
  issues: Issue[];
  total: number;
}

export interface FetchIssueByIdResponse {
  issue: Issue;
}

export interface FetchIssueRepliesResponse {
  replies: IssueReply[];
  total: number;
}

export interface CreateIssueResponse {
  issue: Issue;
}

export interface UpdateIssueResponse {
  issue: Issue;
}

// ============================================
// Request Classes (with validation)
// ============================================

export class CreateIssueRequest implements CreateIssueRequestData {
  type: string;
  entity_id: string;
  title: string;
  description: string;

  constructor(data: CreateIssueRequestData) {
    this.type = data.type;
    this.entity_id = data.entity_id;
    this.title = data.title;
    this.description = data.description;
  }

  validate(): boolean {
    if (!this.type || !this.entity_id || !this.title || !this.description) {
      throw new Error('All fields are required for creating an issue');
    }
    return true;
  }

  toJSON(): CreateIssueRequestData {
    return {
      type: this.type,
      entity_id: this.entity_id,
      title: this.title,
      description: this.description
    };
  }
}

export class UpdateIssueRequest implements UpdateIssueRequestData {
  title?: string;
  description?: string;
  status?: number;

  constructor(data: UpdateIssueRequestData) {
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
  }

  toJSON(): UpdateIssueRequestData {
    const data: UpdateIssueRequestData = {};
    if (this.title !== undefined) data.title = this.title;
    if (this.description !== undefined) data.description = this.description;
    if (this.status !== undefined) data.status = this.status;
    return data;
  }
}

export class UpdateIssueStatusRequest implements UpdateIssueStatusRequestData {
  status: number;

  constructor(data: UpdateIssueStatusRequestData) {
    this.status = parseInt(String(data.status));
  }

  validate(): boolean {
    if (![1, 2, 3, 4].includes(this.status)) {
      throw new Error('Invalid status value. Must be 1, 2, 3, or 4');
    }
    return true;
  }

  toJSON(): UpdateIssueStatusRequestData {
    return { status: this.status };
  }
}

export class CreateIssueReplyRequest implements CreateIssueReplyRequestData {
  message: string;

  constructor(data: CreateIssueReplyRequestData) {
    this.message = data.message;
  }

  validate(): boolean {
    if (!this.message || !this.message.trim()) {
      throw new Error('Reply message cannot be empty');
    }
    return true;
  }

  toJSON(): CreateIssueReplyRequestData {
    return { message: this.message };
  }
}

export class FetchIssuesRequest {
  type?: string;
  entity_id?: string;
  user_id?: string;
  status?: string;
  page?: number;
  page_size?: number;

  constructor(filters: FetchIssuesFilters = {}) {
    this.type = filters.type;
    this.entity_id = filters.entity_id;
    this.user_id = filters.user_id;
    this.status = filters.status;
    this.page = filters.page;
    this.page_size = filters.page_size;
  }

  toQueryParams(): string {
    const params = new URLSearchParams();
    if (this.type) params.append('type', this.type);
    if (this.entity_id) params.append('entity_id', this.entity_id);
    if (this.user_id) params.append('user_id', this.user_id);
    if (this.status) params.append('status', this.status);
    if (this.page) params.append('page', String(this.page));
    if (this.page_size) params.append('page_size', String(this.page_size));
    return params.toString();
  }
}

// ============================================
// Response Transformers
// ============================================

export const transformIssue = (data: any): Issue => ({
  id: data.id,
  type: data.type,
  entity_id: data.entity_id,
  user_id: data.user_id,
  title: data.title,
  description: data.description,
  status: data.status,
  created_at: data.created_at,
  updated_at: data.updated_at
});

export const transformIssueReply = (data: any): IssueReply => ({
  id: data.id,
  issue_id: data.issue_id,
  user_id: data.user_id,
  message: data.message,
  created_at: data.created_at,
  updated_at: data.updated_at
});

export const transformFetchIssuesResponse = (data: any): FetchIssuesResponse => ({
  issues: (data.issues || []).map(transformIssue),
  total: data.total || 0
});

export const transformFetchIssueByIdResponse = (data: any): FetchIssueByIdResponse => ({
  issue: transformIssue(data.issue || data)
});

export const transformFetchIssueRepliesResponse = (data: any): FetchIssueRepliesResponse => ({
  replies: (data.replies || []).map(transformIssueReply),
  total: data.total || 0
});

export const transformCreateIssueResponse = (data: any): CreateIssueResponse => ({
  issue: transformIssue(data.issue || data)
});

export const transformUpdateIssueResponse = (data: any): UpdateIssueResponse => ({
  issue: transformIssue(data.issue || data)
});

export const transformIssueConfig = (data: any): IssueConfig => ({
  types: data.types || []
});
