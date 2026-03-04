/**
 * Rating Models
 * TypeScript interfaces and types for Rating-related operations
 */

// ============================================
// Base Interfaces
// ============================================

export interface Rating {
  id: string;
  productId: number;
  entity: string;
  entityId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingReply {
  id: string;
  ratingId: string;
  userId: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingsConfig {
  entities: string[];
  maxRating: number;
  productIds: number[];
}

// ============================================
// Request Types
// ============================================

export interface CreateRatingRequestData {
  productId: number;
  entity: string;
  entityId: string;
  rating: number;
  comment?: string;
}

export interface UpdateRatingRequestData {
  rating?: number;
  comment?: string;
}

export interface CreateRatingReplyRequestData {
  message: string;
}

export interface FetchRatingsFilters {
  entity?: string;
  entityId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

// ============================================
// Response Types
// ============================================

export interface FetchRatingsResponse {
  ratings: Rating[];
  total: number;
}

export interface FetchRatingByIdResponse {
  rating: Rating;
}

export interface FetchRatingRepliesResponse {
  replies: RatingReply[];
  total: number;
}

export interface CreateRatingResponse {
  rating: Rating;
}

export interface UpdateRatingResponse {
  rating: Rating;
}

// ============================================
// Request Classes (with validation)
// ============================================

export class CreateRatingRequest implements CreateRatingRequestData {
  productId: number;
  entity: string;
  entityId: string;
  rating: number;
  comment: string;

  constructor(data: CreateRatingRequestData) {
    this.productId = data.productId;
    this.entity = data.entity;
    this.entityId = data.entityId;
    this.rating = parseFloat(String(data.rating));
    this.comment = data.comment || '';
  }

  validate(): boolean {
    if (!this.productId || !this.entity || !this.entityId || this.rating === undefined) {
      throw new Error('ProductId, entity, entityId, and rating are required');
    }
    if (this.rating < 0 || this.rating > 10) {
      throw new Error('Rating must be between 0 and 10');
    }
    return true;
  }

  toJSON(): CreateRatingRequestData {
    return {
      productId: this.productId,
      entity: this.entity,
      entityId: this.entityId,
      rating: this.rating,
      comment: this.comment
    };
  }
}

export class UpdateRatingRequest implements UpdateRatingRequestData {
  rating?: number;
  comment?: string;

  constructor(data: UpdateRatingRequestData) {
    this.rating = data.rating !== undefined ? parseFloat(String(data.rating)) : undefined;
    this.comment = data.comment;
  }

  validate(): boolean {
    if (this.rating !== undefined && (this.rating < 0 || this.rating > 10)) {
      throw new Error('Rating must be between 0 and 10');
    }
    return true;
  }

  toJSON(): UpdateRatingRequestData {
    const data: UpdateRatingRequestData = {};
    if (this.rating !== undefined) data.rating = this.rating;
    if (this.comment !== undefined) data.comment = this.comment;
    return data;
  }
}

export class CreateRatingReplyRequest implements CreateRatingReplyRequestData {
  message: string;

  constructor(data: CreateRatingReplyRequestData) {
    this.message = data.message;
  }

  validate(): boolean {
    if (!this.message || !this.message.trim()) {
      throw new Error('Reply message cannot be empty');
    }
    return true;
  }

  toJSON(): CreateRatingReplyRequestData {
    return { message: this.message };
  }
}

export class FetchRatingsRequest {
  entity?: string;
  entityId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;

  constructor(filters: FetchRatingsFilters = {}) {
    this.entity = filters.entity;
    this.entityId = filters.entityId;
    this.userId = filters.userId;
    this.page = filters.page;
    this.pageSize = filters.pageSize;
  }

  toQueryParams(): string {
    const params = new URLSearchParams();
    if (this.entity) params.append('entity', this.entity);
    if (this.entityId) params.append('entityId', this.entityId);
    if (this.userId) params.append('userId', this.userId);
    if (this.page) params.append('page', String(this.page));
    if (this.pageSize) params.append('pageSize', String(this.pageSize));
    return params.toString();
  }
}

// ============================================
// Response Transformers
// ============================================

export const transformRating = (data: any): Rating => ({
  id: data.id,
  productId: data.productId,
  entity: data.entity,
  entityId: data.entityId,
  userId: data.userId,
  rating: data.rating,
  comment: data.comment,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

export const transformRatingReply = (data: any): RatingReply => ({
  id: data.id,
  ratingId: data.ratingId,
  userId: data.userId,
  message: data.message,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

export const transformFetchRatingsResponse = (data: any): FetchRatingsResponse => ({
  ratings: (data.ratings || []).map(transformRating),
  total: data.total || 0
});

export const transformFetchRatingByIdResponse = (data: any): FetchRatingByIdResponse => ({
  rating: transformRating(data.rating || data)
});

export const transformFetchRatingRepliesResponse = (data: any): FetchRatingRepliesResponse => ({
  replies: (data.replies || []).map(transformRatingReply),
  total: data.total || 0
});

export const transformCreateRatingResponse = (data: any): CreateRatingResponse => ({
  rating: transformRating(data.rating || data)
});

export const transformUpdateRatingResponse = (data: any): UpdateRatingResponse => ({
  rating: transformRating(data.rating || data)
});

export const transformRatingsConfig = (data: any): RatingsConfig => ({
  entities: data.entities || [],
  maxRating: data.maxRating || 10,
  productIds: data.productIds || []
});
