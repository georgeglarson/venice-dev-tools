import { AxiosError } from 'axios';
import { ErrorFactory } from '../../errors/factory/error-factory';

/**
 * Handles HTTP request errors and transforms them into appropriate SDK errors.
 */
export class ErrorHandler {
  /**
   * The error factory used to create Venice SDK errors.
   */
  private errorFactory: ErrorFactory;

  /**
   * Create a new error handler.
   * @param errorFactory - The error factory to use.
   */
  constructor(errorFactory: ErrorFactory = new ErrorFactory()) {
    this.errorFactory = errorFactory;
  }

  /**
   * Handle API request errors from standard HTTP requests.
   * @param error - The Axios error.
   * @throws A Venice SDK error.
   */
  public handleRequestError(error: AxiosError): never {
    throw this.errorFactory.createFromAxiosError(error);
  }

  /**
   * Handle API stream errors from streaming HTTP requests.
   * @param error - The error that occurred during streaming.
   * @throws A Venice SDK error.
   */
  public handleStreamError(error: unknown): never {
    throw this.errorFactory.createFromStreamError(error);
  }

  /**
   * Handle errors from response parsing.
   * @param response - The fetch response.
   * @throws A Venice SDK error if the response is not OK.
   */
  public async handleResponseError(response: Response): Promise<void> {
    if (!response.ok) {
      throw await this.errorFactory.createFromFetchResponse(response);
    }
  }
}

export default ErrorHandler;