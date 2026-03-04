/**
 * Issue Models
 * TypeScript interfaces and types for Issue-related operations
 */

// ============================================
// Base Interfaces
// ============================================

export interface Issue {
  id: string;
  productId: number;
  entity: string;
  entityId: string;
  userId: string;
  title: string;
  description: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  issueType: string;
}

export interface IssueReply {
  id: string;
  issueId: string;
  userId: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IssueConfig {
  entities: string[];
  types: string[];
}

// ============================================
// Request Types
// ============================================

export interface CreateIssueRequestData {
  productId: number;
  entity: string;
  entityId: string;
  title: string;
  description: string;
  issueType: string;
}

export interface UpdateIssueRequestData {
  title?: string;
  description?: string;
  status?: number;
  issueType?: string;
}

export interface UpdateIssueStatusRequestData {
  status: number;
}

export interface CreateIssueReplyRequestData {
  message: string;
}

export interface FetchIssuesFilters {
  entity?: string;
  entityId?: string;
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  issueType?: string;
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
  productId: number;
  entity: string;
  entityId: string;
  title: string;
  description: string;
  issueType: string;

  constructor(data: CreateIssueRequestData) {
    this.productId = data.productId;
    this.entity = data.entity;
    this.entityId = data.entityId;
    this.title = data.title;
    this.description = data.description;
    this.issueType = data.issueType;
  }

  validate(): boolean {
    if (!this.productId || !this.entity || !this.entityId || !this.title || !this.description || !this.issueType) {
      throw new Error('All fields are required for creating an issue (ProductId, entity, entityId, title, description, issueType)');
    }
    return true;
  }

  toJSON(): CreateIssueRequestData {
    return {
      productId: this.productId,
      entity: this.entity,
      entityId: this.entityId,
      title: this.title,
      description: this.description,
      issueType: this.issueType
    };
  }
}

export class UpdateIssueRequest implements UpdateIssueRequestData {
  title?: string;
  description?: string;
  status?: number;
  issueType?: string;

  constructor(data: UpdateIssueRequestData) {
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.issueType = data.issueType;
  }

  toJSON(): UpdateIssueRequestData {
    const data: UpdateIssueRequestData = {};
    if (this.title !== undefined) data.title = this.title;
    if (this.description !== undefined) data.description = this.description;
    if (this.status !== undefined) data.status = this.status;
    if (this.issueType !== undefined) data.issueType = this.issueType;
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
  entity?: string;
  entityId?: string;
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  issueType?: string;

  constructor(filters: FetchIssuesFilters = {}) {
    this.entity = filters.entity;
    this.entityId = filters.entityId;
    this.userId = filters.userId;
    this.status = filters.status;
    this.page = filters.page;
    this.pageSize = filters.pageSize;
    this.issueType = filters.issueType;
  }

  toQueryParams(): string {
    const params = new URLSearchParams();
    if (this.entity) params.append('entity', this.entity);
    if (this.entityId) params.append('entityId', this.entityId);
    if (this.userId) params.append('userId', this.userId);
    if (this.status) params.append('status', this.status);
    if (this.page) params.append('page', String(this.page));
    if (this.pageSize) params.append('pageSize', String(this.pageSize));
    if (this.issueType) params.append('issueType', this.issueType);
    return params.toString();
  }
}

// ============================================
// Response Transformers
// ============================================

export const transformIssue = (data: any): Issue => ({
  id: data.id,
  productId: data.productId,
  entity: data.entity,
  entityId: data.entityId,
  userId: data.userId,
  title: data.title,
  description: data.description,
  status: data.status,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  issueType: data.issueType
});

export const transformIssueReply = (data: any): IssueReply => ({
  id: data.id,
  issueId: data.issueId,
  userId: data.userId,
  message: data.message,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
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
  entities: data.entities || [],
  types: data.types || []
});
