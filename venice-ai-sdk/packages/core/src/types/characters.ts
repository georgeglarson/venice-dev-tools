/**
 * Types for the Characters API endpoints
 */

/**
 * Character statistics
 */
export interface CharacterStats {
  averageRating: number;
  imports: number;
  ratingCount: number;
  ratingSum: number;
  userRating: number | null;
}

/**
 * A character available in the Venice AI API
 */
export interface Character {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  shareUrl: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  webEnabled: boolean;
  adult: boolean;
  tags: string[];
  author?: string;
  featured: boolean;
  modelId?: string;
  stats: CharacterStats;
}

/**
 * Response for listing available characters
 */
export interface ListCharactersResponse {
  object: 'list';
  data: Character[];
}

/**
 * A character review
 */
export interface CharacterReview {
  characterId: string;
  createdAt: string;
  id: string;
  isOwner: boolean;
  rating: number;
  review: string;
  username: string;
}

/**
 * Response for listing character reviews
 */
export interface CharacterReviewsResponse {
  data: CharacterReview[];
  summary: {
    averageRating: number;
    totalReviews: number;
  };
}

/**
 * Parameters for listing character reviews
 */
export interface ListCharacterReviewsParams {
  slug: string;
  page?: number;
  pageSize?: number;
}
