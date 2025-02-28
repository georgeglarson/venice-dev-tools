/**
 * Base Resource class
 * 
 * This class serves as the base for all API resources.
 * It provides common functionality for making API requests.
 */

import { HttpClient } from '../utils/http';
import { RequestParams } from '../types/common';

/**
 * Base Resource class
 */
export abstract class BaseResource {
  /**
   * HTTP client for making API requests
   */
  protected http: HttpClient;

  /**
   * Creates a new resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Makes a GET request to the API
   * 
   * @param path - API path
   * @param query - Query parameters
   * @param options - Additional request options
   * @returns Promise that resolves with the response data
   */
  protected async get<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
    options: Partial<RequestParams> = {}
  ): Promise<T> {
    return this.http.request<T>({
      path,
      method: 'GET',
      query,
      ...options,
    });
  }

  /**
   * Makes a POST request to the API
   * 
   * @param path - API path
   * @param body - Request body
   * @param options - Additional request options
   * @returns Promise that resolves with the response data
   */
  protected async post<T>(
    path: string,
    body?: any,
    options: Partial<RequestParams> = {}
  ): Promise<T> {
    return this.http.request<T>({
      path,
      method: 'POST',
      body,
      ...options,
    });
  }

  /**
   * Makes a PUT request to the API
   * 
   * @param path - API path
   * @param body - Request body
   * @param options - Additional request options
   * @returns Promise that resolves with the response data
   */
  protected async put<T>(
    path: string,
    body?: any,
    options: Partial<RequestParams> = {}
  ): Promise<T> {
    return this.http.request<T>({
      path,
      method: 'PUT',
      body,
      ...options,
    });
  }

  /**
   * Makes a DELETE request to the API
   * 
   * @param path - API path
   * @param query - Query parameters
   * @param options - Additional request options
   * @returns Promise that resolves with the response data
   */
  protected async delete<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
    options: Partial<RequestParams> = {}
  ): Promise<T> {
    return this.http.request<T>({
      path,
      method: 'DELETE',
      query,
      ...options,
    });
  }
}