import { ApiEndpoint } from '../../registry/endpoint';
import { ListCharactersResponse } from '../../../types/characters';

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
}

// Default export
export default CharactersEndpoint;
