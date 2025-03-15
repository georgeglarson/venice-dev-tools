/**
 * Types for the Characters API endpoints
 */

/**
 * A character available in the Venice AI API
 */
export interface Character {
  name: string;
  description: string | null;
  slug: string;
  shareUrl: string | null;
  createdAt: string;
  updatedAt: string;
  webEnabled: boolean;
  adult: boolean;
  tags: string[];
  stats: {
    imports: number;
  };
}

/**
 * Response for listing available characters
 */
export interface ListCharactersResponse {
  object: 'list';
  data: Character[];
}
