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
  entity_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RatingReply {
  id: string;
  rating_id: string;
  user_id: string;
  message: string;
  created_at?: string;
  updated_at?: string;
}

export interface RatingTypes {
  types: string[];
  max_rating: number;
}

// ============================================
// Request Types
// ============================================

export interface CreateRatingRequestData {
  type: string;
  entity_id: string;
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
  entity_id?: string;
  user_id?: string;
  page?: number;
  page_size?: number;
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
  entity_id: string;
  rating: number;
  comment: string;

  constructor(data: CreateRatingRequestData) {
    this.type = data.type;
    this.entity_id = data.entity_id;
    this.rating = parseFloat(String(data.rating));
    this.comment = data.comment || '';
  }

  validate(): boolean {
    if (!this.type || !this.entity_id || this.rating === undefined) {
      throw new Error('Type, entity_id, and rating are required');
    }
    if (this.rating < 0 || this.rating > 10) {
      throw new Error('Rating must be between 0 and 10');
    }
    return true;
  }

  toJSON(): CreateRatingRequestData {
    return {
      type: this.type,
      entity_id: this.entity_id,
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
  entity_id?: string;
  user_id?: string;
  page?: number;
  page_size?: number;

  constructor(filters: FetchRatingsFilters = {}) {
    this.type = filters.type;
    this.entity_id = filters.entity_id;
    this.user_id = filters.user_id;
    this.page = filters.page;
    this.page_size = filters.page_size;
  }

  toQueryParams(): string {
    const params = new URLSearchParams();
    if (this.type) params.append('type', this.type);
    if (this.entity_id) params.append('entity_id', this.entity_id);
    if (this.user_id) params.append('user_id', this.user_id);
    if (this.page) params.append('page', String(this.page));
    if (this.page_size) params.append('page_size', String(this.page_size));
    return params.toString();
  }
}

// ============================================
// Response Transformers
// ============================================

export const transformRating = (data: any): Rating => ({
  id: data.id,
  type: data.type,
  entity_id: data.entity_id,
  user_id: data.user_id,
  rating: data.rating,
  comment: data.comment,
  created_at: data.created_at,
  updated_at: data.updated_at
});

export const transformRatingReply = (data: any): RatingReply => ({
  id: data.id,
  rating_id: data.rating_id,
  user_id: data.user_id,
  message: data.message,
  created_at: data.created_at,
  updated_at: data.updated_at
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

export const transformRatingTypes = (data: any): RatingTypes => ({
  types: data.types || [],
  max_rating: data.max_rating || 10
});
