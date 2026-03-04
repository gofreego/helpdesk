/**
 * Rating Models
 * TypeScript interfaces and types for Rating-related operations
 */

// ============================================
// Base Interfaces
// ============================================

export interface Rating {
  id: string;
  type: string;
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
  types: string[];
  maxRating: number;
}

// ============================================
// Request Types
// ============================================

export interface CreateRatingRequestData {
  type: string;
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
  type?: string;
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
  type: string;
  entityId: string;
  rating: number;
  comment: string;

  constructor(data: CreateRatingRequestData) {
    this.type = data.type;
    this.entityId = data.entityId;
    this.rating = parseFloat(String(data.rating));
    this.comment = data.comment || '';
  }

  validate(): boolean {
    if (!this.type || !this.entityId || this.rating === undefined) {
      throw new Error('Type, entityId, and rating are required');
    }
    if (this.rating < 0 || this.rating > 10) {
      throw new Error('Rating must be between 0 and 10');
    }
    return true;
  }

  toJSON(): CreateRatingRequestData {
    return {
      type: this.type,
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
  type?: string;
  entityId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;

  constructor(filters: FetchRatingsFilters = {}) {
    this.type = filters.type;
    this.entityId = filters.entityId;
    this.userId = filters.userId;
    this.page = filters.page;
    this.pageSize = filters.pageSize;
  }

  toQueryParams(): string {
    const params = new URLSearchParams();
    if (this.type) params.append('type', this.type);
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
  type: data.type,
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
  types: data.types || [],
  maxRating: data.maxRating || 10
});
