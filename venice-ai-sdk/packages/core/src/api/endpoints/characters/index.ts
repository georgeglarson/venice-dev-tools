import { ApiEndpoint } from '../../registry/endpoint';
import { ListCharactersResponse, CharacterReviewsResponse, ListCharacterReviewsParams } from '../../../types/characters';

/**
 * API endpoint for character-related operations
 */
export class CharactersEndpoint extends ApiEndpoint {
  /**
   * Gets the base endpoint path
   * @returns The endpoint path
   */
  getEndpointPath(): string {
    return '/characters';
  }

  /**
   * List available characters
   * @returns A promise that resolves to a list of available characters
   */
  public async list(): Promise<ListCharactersResponse> {
    // Emit a request event
    this.emit('request', { type: 'characters.list' });

    // Make the API request
    const response = await this.http.get<ListCharactersResponse>(
      this.getPath('')
    );

    // Emit a response event
    this.emit('response', {
      type: 'characters.list',
      data: { count: response.data.data.length }
    });

    return response.data;
  }

  /**
   * Get reviews for a character
   * @param params - The character slug and optional pagination parameters
   * @returns A promise that resolves to a list of reviews with summary
   */
  public async getReviews(params: ListCharacterReviewsParams): Promise<CharacterReviewsResponse> {
    this.emit('request', { type: 'characters.getReviews', slug: params.slug });

    const queryParams: Record<string, string> = {};
    if (params.page !== undefined) queryParams.page = String(params.page);
    if (params.pageSize !== undefined) queryParams.pageSize = String(params.pageSize);

    const query = Object.keys(queryParams).length
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';

    const response = await this.http.get<CharacterReviewsResponse>(
      this.getPath(`/${params.slug}/reviews${query}`)
    );

    this.emit('response', { type: 'characters.getReviews', data: response.data });

    return response.data;
  }
}

// Default export
export default CharactersEndpoint;
