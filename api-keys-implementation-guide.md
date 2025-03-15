# API Keys Endpoint Implementation Guide

This guide provides detailed instructions for implementing the API Keys endpoint in the Venice AI SDK.

## Step 1: Create Types

First, create or update the types in `venice-ai-sdk/packages/core/src/types/keys.ts`:

```typescript
/**
 * API Key interface
 */
export interface ApiKey {
  id: string;
  description: string;
  last6Chars: string;
  createdAt: string | null;
  expiresAt: string | null;
  lastUsedAt: string | null;
  apiKeyType: 'ADMIN' | 'INFERENCE';
  usage: {
    trailingSevenDays: {
      vcu: string;
      usd: string;
    };
  };
  consumptionLimits: {
    vcu: number | null;
    usd: number | null;
  };
}

/**
 * Response for listing API keys
 */
export interface ListApiKeysResponse {
  object: 'list';
  data: ApiKey[];
}

/**
 * Request for creating an API key
 */
export interface CreateApiKeyRequest {
  description: string;
  apiKeyType: 'ADMIN' | 'INFERENCE';
  expiresAt?: string;
  consumptionLimit: {
    vcu: number | null;
    usd: number | null;
  };
}

/**
 * Response for creating an API key
 */
export interface CreateApiKeyResponse {
  success: boolean;
  data: {
    id: string;
    apiKey: string;
    description: string;
    expiresAt: string | null;
    apiKeyType: 'ADMIN' | 'INFERENCE';
    consumptionLimit: {
      vcu: number | null;
      usd: number | null;
    };
  };
}

/**
 * Response for deleting an API key
 */
export interface DeleteApiKeyResponse {
  success: boolean;
}

/**
 * Response for getting rate limits
 */
export interface GetRateLimitsResponse {
  data: {
    apiTier: {
      id: string;
      isCharged: boolean;
    };
    accessPermitted: boolean;
    balances: {
      VCU: number;
      USD: number;
    };
    rateLimits: Array<{
      apiModelId: string;
      rateLimits: Array<{
        amount: number;
        type: string;
      }>;
    }>;
  };
}

/**
 * Response for getting rate limit logs
 */
export interface GetRateLimitLogsResponse {
  object: 'list';
  data: Array<{
    apiKeyId: string;
    modelId: string;
    rateLimitType: string;
    rateLimitTier: string;
    timestamp: string;
  }>;
}

/**
 * Response for generating a web3 token
 */
export interface GenerateWeb3TokenResponse {
  success: boolean;
  data: {
    token: string;
  };
}

/**
 * Request for creating an API key with web3 authentication
 */
export interface CreateWeb3ApiKeyRequest {
  description?: string;
  apiKeyType: 'ADMIN' | 'INFERENCE';
  expiresAt?: string;
  consumptionLimit: {
    vcu: number | null;
    usd: number | null;
  };
  signature: string;
  token: string;
  address: string;
}
```

## Step 2: Create API Keys Endpoint Class

Create the file `venice-ai-sdk/packages/core/src/api/endpoints/keys/api-keys-endpoint.ts`:

```typescript
import { ApiEndpoint } from '../../registry/endpoint';
import {
  ListApiKeysResponse,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  GetRateLimitsResponse,
  GetRateLimitLogsResponse,
  GenerateWeb3TokenResponse,
  CreateWeb3ApiKeyRequest
} from '../../../types/keys';

/**
 * API endpoint for API key-related operations
 */
export class ApiKeysEndpoint extends ApiEndpoint {
  /**
   * Gets the base endpoint path
   * @returns The endpoint path
   */
  getEndpointPath(): string {
    return '/api_keys';
  }

  /**
   * List API keys
   * @returns A promise that resolves to a list of API keys
   */
  public async list(): Promise<ListApiKeysResponse> {
    // Emit a request event
    this.emit('request', { type: 'api_keys.list' });

    // Make the API request
    const response = await this.http.get<ListApiKeysResponse>(
      this.getPath('')
    );

    // Emit a response event
    this.emit('response', {
      type: 'api_keys.list',
      data: { count: response.data.data.length }
    });

    return response.data;
  }

  /**
   * Create a new API key
   * @param params - The parameters for creating an API key
   * @returns A promise that resolves to the created API key
   */
  public async create(params: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    // Emit a request event
    this.emit('request', { type: 'api_keys.create', data: params });

    // Make the API request
    const response = await this.http.post<CreateApiKeyResponse>(
      this.getPath(''),
      params
    );

    // Emit a response event
    this.emit('response', {
      type: 'api_keys.create',
      data: { id: response.data.data.id }
    });

    return response.data;
  }

  /**
   * Delete an API key
   * @param id - The ID of the API key to delete
   * @returns A promise that resolves to the deletion result
   */
  public async delete(id: string): Promise<DeleteApiKeyResponse> {
    // Emit a request event
    this.emit('request', { type: 'api_keys.delete', data: { id } });

    // Make the API request
    const response = await this.http.delete<DeleteApiKeyResponse>(
      this.getPath(''),
      { params: { id } }
    );

    // Emit a response event
    this.emit('response', {
      type: 'api_keys.delete',
      data: { success: response.data.success }
    });

    return response.data;
  }

  /**
   * Get rate limits and balances
   * @returns A promise that resolves to the rate limits and balances
   */
  public async getRateLimits(): Promise<GetRateLimitsResponse> {
    // Emit a request event
    this.emit('request', { type: 'api_keys.rate_limits' });

    // Make the API request
    const response = await this.http.get<GetRateLimitsResponse>(
      this.getPath('/rate_limits')
    );

    // Emit a response event
    this.emit('response', {
      type: 'api_keys.rate_limits',
      data: { accessPermitted: response.data.data.accessPermitted }
    });

    return response.data;
  }

  /**
   * Get rate limit logs
   * @returns A promise that resolves to the rate limit logs
   */
  public async getRateLimitLogs(): Promise<GetRateLimitLogsResponse> {
    // Emit a request event
    this.emit('request', { type: 'api_keys.rate_limits.log' });

    // Make the API request
    const response = await this.http.get<GetRateLimitLogsResponse>(
      this.getPath('/rate_limits/log')
    );

    // Emit a response event
    this.emit('response', {
      type: 'api_keys.rate_limits.log',
      data: { count: response.data.data.length }
    });

    return response.data;
  }

  /**
   * Generate a token for web3 authentication
   * @returns A promise that resolves to the generated token
   */
  public async generateWeb3Token(): Promise<GenerateWeb3TokenResponse> {
    // Emit a request event
    this.emit('request', { type: 'api_keys.generate_web3_key' });

    // Make the API request
    const response = await this.http.get<GenerateWeb3TokenResponse>(
      this.getPath('/generate_web3_key')
    );

    // Emit a response event
    this.emit('response', {
      type: 'api_keys.generate_web3_key',
      data: { success: response.data.success }
    });

    return response.data;
  }

  /**
   * Create an API key with web3 authentication
   * @param params - The parameters for creating an API key with web3 authentication
   * @returns A promise that resolves to the created API key
   */
  public async createWithWeb3(params: CreateWeb3ApiKeyRequest): Promise<CreateApiKeyResponse> {
    // Emit a request event
    this.emit('request', { type: 'api_keys.create_with_web3', data: params });

    // Make the API request
    const response = await this.http.post<CreateApiKeyResponse>(
      this.getPath('/generate_web3_key'),
      params
    );

    // Emit a response event
    this.emit('response', {
      type: 'api_keys.create_with_web3',
      data: { id: response.data.data.id }
    });

    return response.data;
  }
}

// Default export
export default ApiKeysEndpoint;
```

## Step 3: Update Client Class

Update the client class in `venice-ai-sdk/packages/core/src/client.ts` to include the API Keys endpoint:

```typescript
// Add import
import ApiKeysEndpoint from './api/endpoints/keys/api-keys-endpoint';

export class VeniceClient {
  // Add private property
  private _apiKeys: ApiKeysEndpoint;

  constructor(config: VeniceClientConfig) {
    // Existing initialization
    
    // Initialize API Keys endpoint
    this._apiKeys = new ApiKeysEndpoint(this.http, this.eventManager);
  }

  // Add getter for API Keys endpoint
  get apiKeys(): ApiKeysEndpoint {
    return this._apiKeys;
  }
}
```

## Step 4: Create CLI Command

Create the file `venice-ai-sdk/packages/node/src/cli/commands/api-keys.ts`:

```typescript
import { Command } from 'commander';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { VeniceNode } from '../../venice-node';

/**
 * Register API keys commands with the CLI
 */
export function registerApiKeysCommands(program: Command, venice: VeniceNode): void {
  const apiKeys = program
    .command('api-keys')
    .description('Manage Venice AI API keys');

  // List API keys
  apiKeys
    .command('list')
    .description('List your API keys')
    .action(async () => {
      try {
        const response = await venice.apiKeys.list();
        console.log(chalk.green('API Keys:'));
        response.data.forEach(key => {
          console.log(chalk.cyan(`ID: ${key.id}`));
          console.log(`Description: ${key.description}`);
          console.log(`Type: ${key.apiKeyType}`);
          console.log(`Last 6 Chars: ${key.last6Chars}`);
          console.log(`Created: ${key.createdAt}`);
          console.log(`Expires: ${key.expiresAt || 'Never'}`);
          console.log(`Last Used: ${key.lastUsedAt || 'Never'}`);
          console.log(`VCU Limit: ${key.consumptionLimits.vcu || 'None'}`);
          console.log(`USD Limit: ${key.consumptionLimits.usd || 'None'}`);
          console.log('');
        });
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // Create API key
  apiKeys
    .command('create')
    .description('Create a new API key')
    .option('-d, --description <description>', 'API key description')
    .option('-t, --type <type>', 'API key type (ADMIN or INFERENCE)', 'INFERENCE')
    .option('-e, --expires <date>', 'Expiration date (YYYY-MM-DD)')
    .option('--vcu-limit <limit>', 'VCU consumption limit')
    .option('--usd-limit <limit>', 'USD consumption limit')
    .action(async (options) => {
      try {
        // Get description if not provided
        let description = options.description;
        if (!description) {
          const response = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Enter a description for the API key:',
              default: 'API Key'
            }
          ]);
          description = response.description;
        }

        // Create the API key
        const response = await venice.apiKeys.create({
          description,
          apiKeyType: options.type as 'ADMIN' | 'INFERENCE',
          expiresAt: options.expires,
          consumptionLimit: {
            vcu: options.vcuLimit ? Number(options.vcuLimit) : null,
            usd: options.usdLimit ? Number(options.usdLimit) : null
          }
        });

        console.log(chalk.green('API Key created successfully!'));
        console.log(chalk.yellow('Save this API key, it will not be shown again:'));
        console.log(chalk.cyan(`API Key: ${response.data.apiKey}`));
        console.log(`ID: ${response.data.id}`);
        console.log(`Description: ${response.data.description}`);
        console.log(`Type: ${response.data.apiKeyType}`);
        console.log(`Expires: ${response.data.expiresAt || 'Never'}`);
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // Delete API key
  apiKeys
    .command('delete')
    .description('Delete an API key')
    .argument('<id>', 'API key ID')
    .action(async (id) => {
      try {
        // Confirm deletion
        const response = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete API key ${id}?`,
            default: false
          }
        ]);

        if (!response.confirm) {
          console.log(chalk.yellow('Deletion cancelled.'));
          return;
        }

        // Delete the API key
        await venice.apiKeys.delete(id);
        console.log(chalk.green(`API key ${id} deleted successfully!`));
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // Get rate limits
  apiKeys
    .command('rate-limits')
    .description('Get rate limits and balances')
    .action(async () => {
      try {
        const response = await venice.apiKeys.getRateLimits();
        console.log(chalk.green('Rate Limits and Balances:'));
        console.log(`API Tier: ${response.data.apiTier.id}`);
        console.log(`Is Charged: ${response.data.apiTier.isCharged}`);
        console.log(`Access Permitted: ${response.data.accessPermitted}`);
        console.log(chalk.cyan('Balances:'));
        console.log(`VCU: ${response.data.balances.VCU}`);
        console.log(`USD: ${response.data.balances.USD}`);
        console.log(chalk.cyan('Rate Limits:'));
        response.data.rateLimits.forEach(limit => {
          console.log(`Model: ${limit.apiModelId}`);
          limit.rateLimits.forEach(rateLimit => {
            console.log(`  ${rateLimit.type}: ${rateLimit.amount}`);
          });
        });
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // Get rate limit logs
  apiKeys
    .command('rate-limit-logs')
    .description('Get rate limit logs')
    .action(async () => {
      try {
        const response = await venice.apiKeys.getRateLimitLogs();
        console.log(chalk.green('Rate Limit Logs:'));
        response.data.forEach(log => {
          console.log(chalk.cyan(`Timestamp: ${log.timestamp}`));
          console.log(`API Key ID: ${log.apiKeyId}`);
          console.log(`Model: ${log.modelId}`);
          console.log(`Rate Limit Type: ${log.rateLimitType}`);
          console.log(`Rate Limit Tier: ${log.rateLimitTier}`);
          console.log('');
        });
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // Web3 commands
  const web3 = apiKeys
    .command('web3')
    .description('Web3 API key operations');

  // Generate token
  web3
    .command('generate-token')
    .description('Generate a token for web3 authentication')
    .action(async () => {
      try {
        const response = await venice.apiKeys.generateWeb3Token();
        console.log(chalk.green('Web3 Token:'));
        console.log(chalk.cyan(`Token: ${response.data.token}`));
        console.log(chalk.yellow('Use this token to sign with your wallet.'));
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // Create with web3
  web3
    .command('create')
    .description('Create API key with web3 authentication')
    .requiredOption('-a, --address <address>', 'Wallet address')
    .requiredOption('-s, --signature <signature>', 'Signature')
    .requiredOption('-t, --token <token>', 'Token')
    .option('-d, --description <description>', 'API key description', 'Web3 API Key')
    .option('--type <type>', 'API key type (ADMIN or INFERENCE)', 'INFERENCE')
    .option('-e, --expires <date>', 'Expiration date (YYYY-MM-DD)')
    .option('--vcu-limit <limit>', 'VCU consumption limit')
    .option('--usd-limit <limit>', 'USD consumption limit')
    .action(async (options) => {
      try {
        // Create the API key with web3 authentication
        const response = await venice.apiKeys.createWithWeb3({
          description: options.description,
          apiKeyType: options.type as 'ADMIN' | 'INFERENCE',
          expiresAt: options.expires,
          consumptionLimit: {
            vcu: options.vcuLimit ? Number(options.vcuLimit) : null,
            usd: options.usdLimit ? Number(options.usdLimit) : null
          },
          signature: options.signature,
          token: options.token,
          address: options.address
        });

        console.log(chalk.green('API Key created successfully!'));
        console.log(chalk.yellow('Save this API key, it will not be shown again:'));
        console.log(chalk.cyan(`API Key: ${response.data.apiKey}`));
        console.log(`ID: ${response.data.id}`);
        console.log(`Description: ${response.data.description}`);
        console.log(`Type: ${response.data.apiKeyType}`);
        console.log(`Expires: ${response.data.expiresAt || 'Never'}`);
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });
}
```

## Step 5: Update CLI Index

Update the CLI index file `venice-ai-sdk/packages/node/src/cli/index.ts` to register the API Keys commands:

```typescript
// Add import
import { registerApiKeysCommands } from './commands/api-keys';

// In the registerCommands function, add:
registerApiKeysCommands(program, venice);
```

## Step 6: Create Example

Create the file `venice-ai-sdk/examples/api-keys-management.js`:

```javascript
const { VeniceNode } = require('@venice-ai/node');

async function main() {
  // Initialize the Venice AI SDK
  const venice = new VeniceNode({
    apiKey: process.env.VENICE_API_KEY
  });

  try {
    // List API keys
    console.log('Listing API keys:');
    const keys = await venice.apiKeys.list();
    console.log(keys);

    // Get rate limits
    console.log('\nGetting rate limits:');
    const rateLimits = await venice.apiKeys.getRateLimits();
    console.log(rateLimits);

    // Create API key (uncomment to run)
    /*
    console.log('\nCreating a new API key:');
    const newKey = await venice.apiKeys.create({
      description: 'Example API Key',
      apiKeyType: 'INFERENCE',
      consumptionLimit: {
        vcu: 100,
        usd: 50
      }
    });
    console.log(newKey);
    */

    // Get rate limit logs
    console.log('\nGetting rate limit logs:');
    const rateLimitLogs = await venice.apiKeys.getRateLimitLogs();
    console.log(rateLimitLogs);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Step 7: Update Documentation

Create the file `venice-ai-sdk/docs/api/api-keys.md`:

```markdown
# API Keys

The Venice AI SDK provides methods for managing API keys, getting rate limits, and authenticating with web3.

## List API Keys

```typescript
const keys = await venice.apiKeys.list();
```

## Create API Key

```typescript
const newKey = await venice.apiKeys.create({
  description: 'Example API Key',
  apiKeyType: 'INFERENCE',
  consumptionLimit: {
    vcu: 100,
    usd: 50
  }
});
```

## Delete API Key

```typescript
const result = await venice.apiKeys.delete('api-key-id');
```

## Get Rate Limits

```typescript
const rateLimits = await venice.apiKeys.getRateLimits();
```

## Get Rate Limit Logs

```typescript
const rateLimitLogs = await venice.apiKeys.getRateLimitLogs();
```

## Web3 Authentication

### Generate Token

```typescript
const tokenResponse = await venice.apiKeys.generateWeb3Token();
const token = tokenResponse.data.token;
```

### Create API Key with Web3

```typescript
const newKey = await venice.apiKeys.createWithWeb3({
  description: 'Web3 API Key',
  apiKeyType: 'INFERENCE',
  consumptionLimit: {
    vcu: 100,
    usd: 50
  },
  signature: 'signature',
  token: 'token',
  address: 'wallet-address'
});
```
```

## Step 8: Update Examples README

Update `venice-ai-sdk/examples/README.md` to include information about the new example:

```markdown
# API Keys Management (`api-keys-management.js`)

Demonstrates how to use the Venice AI SDK to manage API keys, including:
- Listing API keys
- Creating API keys
- Getting rate limits
- Getting rate limit logs