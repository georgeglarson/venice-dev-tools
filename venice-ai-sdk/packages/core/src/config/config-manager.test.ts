import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from './config-manager';
import { VeniceAuthError } from '../errors';
import type { VeniceClientConfig } from '../types';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager({});
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const config = configManager.getConfig();

      expect(config.baseUrl).toBe('https://api.venice.ai/api/v1');
      expect(config.timeout).toBe(30000);
      expect(config.headers).toEqual({});
    });

    it('should accept custom configuration', () => {
      const customConfig: VeniceClientConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
        headers: { 'Custom-Header': 'value' },
      };

      const manager = new ConfigManager(customConfig);
      const config = manager.getConfig();

      expect(config.apiKey).toBe('test-key');
      expect(config.baseUrl).toBe('https://custom.api.com');
      expect(config.timeout).toBe(60000);
      expect(config.headers).toEqual({ 'Custom-Header': 'value' });
    });

    it('should merge custom config with defaults', () => {
      const manager = new ConfigManager({ apiKey: 'test-key' });
      const config = manager.getConfig();

      expect(config.apiKey).toBe('test-key');
      expect(config.baseUrl).toBe('https://api.venice.ai/api/v1');
      expect(config.timeout).toBe(30000);
    });
  });

  describe('getApiKey', () => {
    it('should return API key when set', () => {
      const manager = new ConfigManager({ apiKey: 'test-key' });
      expect(manager.getApiKey()).toBe('test-key');
    });

    it('should return undefined when API key is not set', () => {
      expect(configManager.getApiKey()).toBeUndefined();
    });

    it('should return empty string when set to empty', () => {
      const manager = new ConfigManager({ apiKey: '' });
      expect(manager.getApiKey()).toBe('');
    });
  });

  describe('getRequiredApiKey', () => {
    it('should return API key when set', () => {
      const manager = new ConfigManager({ apiKey: 'test-key' });
      expect(manager.getRequiredApiKey()).toBe('test-key');
    });

    it('should throw error when API key is not set', () => {
      expect(() => configManager.getRequiredApiKey()).toThrowError(
        'No API key set. Use setApiKey() to set your API key.'
      );
    });

    it('should throw error when API key is empty string', () => {
      const manager = new ConfigManager({ apiKey: '' });
      expect(() => manager.getRequiredApiKey()).toThrowError(
        'No API key set. Use setApiKey() to set your API key.'
      );
    });
  });

  describe('setApiKey', () => {
    it('should set API key', () => {
      configManager.setApiKey('new-key');
      expect(configManager.getApiKey()).toBe('new-key');
    });

    it('should update existing API key', () => {
      const manager = new ConfigManager({ apiKey: 'old-key' });
      manager.setApiKey('new-key');
      expect(manager.getApiKey()).toBe('new-key');
    });

    it('should throw error for empty string', () => {
      expect(() => configManager.setApiKey('')).toThrowError('API key cannot be empty');
    });
  });

  describe('getBaseUrl', () => {
    it('should return default base URL', () => {
      expect(configManager.getBaseUrl()).toBe('https://api.venice.ai/api/v1');
    });

    it('should return custom base URL', () => {
      const manager = new ConfigManager({ baseUrl: 'https://custom.api.com' });
      expect(manager.getBaseUrl()).toBe('https://custom.api.com');
    });
  });

  describe('getTimeout', () => {
    it('should return default timeout', () => {
      expect(configManager.getTimeout()).toBe(30000);
    });

    it('should return custom timeout', () => {
      const manager = new ConfigManager({ timeout: 60000 });
      expect(manager.getTimeout()).toBe(60000);
    });
  });

  describe('getHeaders', () => {
    it('should return empty headers by default', () => {
      expect(configManager.getHeaders()).toEqual({});
    });

    it('should return custom headers', () => {
      const headers = { 'Custom-Header': 'value', 'Another': 'header' };
      const manager = new ConfigManager({ headers });
      expect(manager.getHeaders()).toEqual(headers);
    });

    it('should not include API key in headers', () => {
      const manager = new ConfigManager({ apiKey: 'test-key' });
      const headers = manager.getHeaders();
      expect(headers).not.toHaveProperty('Authorization');
      expect(headers).not.toHaveProperty('X-API-Key');
    });
  });

  describe('getConfig', () => {
    it('should return complete configuration', () => {
      const config = configManager.getConfig();

      expect(config).toHaveProperty('baseUrl');
      expect(config).toHaveProperty('timeout');
      expect(config).toHaveProperty('headers');
    });

    it('should return configuration snapshot', () => {
      const config1 = configManager.getConfig();
      configManager.setApiKey('new-key');
      const config2 = configManager.getConfig();

      expect(config2.apiKey).toBe('new-key');
    });
  });

  describe('setHeader', () => {
    it('should set a custom header', () => {
      configManager.setHeader('Custom-Header', 'value');
      const headers = configManager.getHeaders();
      expect(headers['Custom-Header']).toBe('value');
    });

    it('should merge headers instead of replacing', () => {
      const manager = new ConfigManager({
        headers: { 'Header1': 'value1' },
      });

      manager.setHeader('Header2', 'value2');

      const headers = manager.getHeaders();
      expect(headers).toEqual({
        'Header1': 'value1',
        'Header2': 'value2',
      });
    });

    it('should update existing header', () => {
      configManager.setHeader('Test-Header', 'old-value');
      configManager.setHeader('Test-Header', 'new-value');
      
      const headers = configManager.getHeaders();
      expect(headers['Test-Header']).toBe('new-value');
    });
  });

  describe('edge cases', () => {
    it('should handle zero timeout', () => {
      const manager = new ConfigManager({ timeout: 0 });
      expect(manager.getTimeout()).toBe(30000);
    });

    it('should handle special characters in API key', () => {
      const specialKey = 'key-with-special_chars.123!@#';
      configManager.setApiKey(specialKey);
      expect(configManager.getApiKey()).toBe(specialKey);
    });

    it('should return default timeout when undefined', () => {
      const manager = new ConfigManager({ timeout: undefined });
      expect(manager.getTimeout()).toBe(30000);
    });

    it('should return default baseUrl when undefined', () => {
      const manager = new ConfigManager({ baseUrl: undefined });
      expect(manager.getBaseUrl()).toBe('https://api.venice.ai/api/v1');
    });
  });
});
