# API Keys

The Venice Dev Tools provides methods for managing API keys, getting rate limits, and authenticating with web3.

## List API Keys

```typescript
const keys = await venice.keys.list();
```

Lists all API keys associated with your account.

### Returns

An object containing an array of API keys.

### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const keys = await venice.keys.list();
console.log(keys.api_keys);
```

## Create API Key

```typescript
const newKey = await venice.keys.create({
  name: 'Example API Key'
});
```

Creates a new API key with the specified name.

### Parameters

- `options`: The API key creation options
  - `name`: The name of the API key

### Returns

An object containing the newly created API key.

### Example

```typescript
const newKey = await venice.keys.create({
  name: 'Example API Key'
});
console.log(newKey.api_key);
```

## Retrieve API Key

```typescript
const key = await venice.keys.retrieve('api-key-id');
```

Retrieves an API key by its ID.

### Parameters

- `id`: The ID of the API key to retrieve

### Returns

An object containing the API key details.

### Example

```typescript
const key = await venice.keys.retrieve('api-key-id');
console.log(key);
```

## Update API Key

```typescript
const updatedKey = await venice.keys.update('api-key-id', {
  name: 'Updated API Key Name'
});
```

Updates an API key with the specified options.

### Parameters

- `id`: The ID of the API key to update
- `options`: The API key update options
  - `name`: The new name of the API key

### Returns

An object containing the updated API key details.

### Example

```typescript
const updatedKey = await venice.keys.update('api-key-id', {
  name: 'Updated API Key Name'
});
console.log(updatedKey);
```

## Delete API Key

```typescript
await venice.keys.delete({ id: 'api-key-id' });
```

Deletes an API key by its ID.

### Parameters

- `options`: The API key deletion options
  - `id`: The ID of the API key to delete

### Returns

A confirmation object.

### Example

```typescript
await venice.keys.delete({ id: 'api-key-id' });
```

## Revoke API Key

```typescript
await venice.keys.revoke('api-key-id');
```

Revokes an API key by its ID.

### Parameters

- `id`: The ID of the API key to revoke

### Returns

A confirmation object.

### Example

```typescript
await venice.keys.revoke('api-key-id');
```

## Get Rate Limits

```typescript
const rateLimits = await venice.keys.getRateLimits();
```

Gets the rate limits for your API key.

### Returns

An object containing the rate limit information.

### Example

```typescript
const rateLimits = await venice.keys.getRateLimits();
console.log(rateLimits);
```

## Get Rate Limit Logs

```typescript
const rateLimitLogs = await venice.keys.getRateLimitLogs();
```

Gets the rate limit logs for your API key.

### Returns

An object containing the rate limit logs.

### Example

```typescript
const rateLimitLogs = await venice.keys.getRateLimitLogs();
console.log(rateLimitLogs);
```

## Web3 Authentication

Venice Dev Tools v2.1 introduces Web3 authentication for API key management, allowing you to create API keys using Web3 wallets.

### Generate Token

```typescript
const tokenResponse = await venice.keys.generateWeb3Token();
const token = tokenResponse.token;
```

Generates a token for Web3 authentication.

### Returns

An object containing the generated token.

### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode();

const tokenResponse = await venice.keys.generateWeb3Token();
const token = tokenResponse.token;
console.log(token);
```

### Create API Key with Web3

```typescript
const newKey = await venice.keys.createWithWeb3({
  address: 'wallet-address',
  signature: 'signature',
  token: 'token',
  description: 'Web3 API Key',
  apiKeyType: 'INFERENCE',
  consumptionLimit: {
    vcu: 100,
    usd: 50
  }
});
```

Creates a new API key using Web3 authentication.

### Parameters

- `options`: The Web3 API key creation options
  - `address`: The wallet address
  - `signature`: The signature of the token
  - `token`: The token generated with generateWeb3Token
  - `description`: A description for the API key
  - `apiKeyType`: The type of API key (e.g., 'INFERENCE')
  - `consumptionLimit`: Optional consumption limits
    - `vcu`: Venice Compute Units limit
    - `usd`: USD limit

### Returns

An object containing the newly created API key.

### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';
import { ethers } from 'ethers';

const venice = new VeniceNode();

async function createApiKeyWithWeb3() {
  // Generate a token
  const tokenResponse = await venice.keys.generateWeb3Token();
  const token = tokenResponse.token;
  
  // Connect to a wallet (example using ethers.js)
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  
  // Sign the token
  const signature = await signer.signMessage(token);
  
  // Create the API key
  const newKey = await venice.keys.createWithWeb3({
    address: address,
    signature: signature,
    token: token,
    description: 'My Web3 API Key',
    apiKeyType: 'INFERENCE',
    consumptionLimit: {
      vcu: 100,
      usd: 50
    }
  });
  
  console.log('New API Key:', newKey.api_key);
}

createApiKeyWithWeb3().catch(console.error);
```

## Web3 Key Management Workflow

1. Generate a token using `generateWeb3Token()`
2. Sign the token with a Web3 wallet
3. Create an API key using `createWithWeb3()` with the wallet address, signature, and token
4. Use the new API key for authentication

This workflow allows for secure, decentralized API key management without requiring traditional authentication methods.