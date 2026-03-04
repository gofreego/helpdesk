/**
 * Rating Service
 * Handles all rating-related API calls
 */

import * as apiService from './api.service';
import {
  CreateRatingRequest,
  UpdateRatingRequest,
  CreateRatingReplyRequest,
  FetchRatingsRequest,
  FetchRatingsResponse,
  FetchRatingByIdResponse,
  FetchRatingRepliesResponse,
  CreateRatingResponse,
  UpdateRatingResponse,
  RatingTypes,
  transformFetchRatingsResponse,
  transformFetchRatingByIdResponse,
  transformFetchRatingRepliesResponse,
  transformCreateRatingResponse,
  transformUpdateRatingResponse,
  transformRatingTypes
} from '@/models/rating.model';

/**
 * Fetch all ratings with optional filters
 */
export const fetchRatings = async (
  filters?: FetchRatingsRequest | Record<string, any>
): Promise<FetchRatingsResponse> => {
  const request = filters instanceof FetchRatingsRequest
    ? filters
    : new FetchRatingsRequest(filters);
  
  const queryString = request.toQueryParams();
  const endpoint = queryString ? `/ratings?${queryString}` : '/ratings';
  
  const data = await apiService.get(endpoint);
  return transformFetchRatingsResponse(data);
};

/**
 * Fetch a single rating by ID
 */
export const fetchRatingById = async (ratingId: string): Promise<FetchRatingByIdResponse> => {
  const data = await apiService.get(`/ratings/${ratingId}`);
  return transformFetchRatingByIdResponse(data);
};

/**
 * Fetch replies for a rating
 */
export const fetchRatingReplies = async (
  ratingId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<FetchRatingRepliesResponse> => {
  const data = await apiService.get(
    `/ratings/${ratingId}/replies?page=${page}&page_size=${pageSize}`
  );
  return transformFetchRatingRepliesResponse(data);
};

/**
 * Create a new rating
 */
export const createRating = async (
  ratingData: CreateRatingRequest | Record<string, any>
): Promise<CreateRatingResponse> => {
  const request = ratingData instanceof CreateRatingRequest
    ? ratingData
    : new CreateRatingRequest(ratingData as any);
  
  request.validate();
  
  const data = await apiService.post('/ratings', request.toJSON());
  return transformCreateRatingResponse(data);
};

/**
 * Update an existing rating
 */
export const updateRating = async (
  ratingId: string,
  updates: UpdateRatingRequest | Record<string, any>
): Promise<UpdateRatingResponse> => {
  const request = updates instanceof UpdateRatingRequest
    ? updates
    : new UpdateRatingRequest(updates);
  
  request.validate();
  
  const data = await apiService.put(`/ratings/${ratingId}`, request.toJSON());
  return transformUpdateRatingResponse(data);
};

/**
 * Delete a rating
 */
export const deleteRating = async (ratingId: string): Promise<void> => {
  await apiService.del(`/ratings/${ratingId}`);
};

/**
 * Add a reply to a rating
 */
export const createRatingReply = async (
  ratingId: string,
  replyData: CreateRatingReplyRequest | Record<string, any>
): Promise<any> => {
  const request = replyData instanceof CreateRatingReplyRequest
    ? replyData
    : new CreateRatingReplyRequest(replyData as any);
  
  request.validate();
  
  return await apiService.post(`/ratings/${ratingId}/replies`, request.toJSON());
};

/**
 * Delete a rating reply
 */
export const deleteRatingReply = async (replyId: string): Promise<void> => {
  await apiService.del(`/rating-replies/${replyId}`);
};

/**
 * Get rating types
 */
export const getRatingTypes = async (): Promise<RatingTypes> => {
  const data = await apiService.get('/rating-types');
  return transformRatingTypes(data);
};

// Alias for backward compatibility
export const fetchRatingTypes = getRatingTypes;
