# API Keys

The Venice AI SDK provides methods for managing API keys, getting rate limits, and authenticating with web3.

## List API Keys

```typescript
const keys = await venice.keys.list();
```

## Create API Key

```typescript
const newKey = await venice.keys.create({
  name: 'Example API Key'
});
```

## Retrieve API Key

```typescript
const key = await venice.keys.retrieve('api-key-id');
```

## Update API Key

```typescript
const updatedKey = await venice.keys.update('api-key-id', {
  name: 'Updated API Key Name'
});
```

## Delete API Key

```typescript
await venice.keys.delete({ id: 'api-key-id' });
```

## Revoke API Key

```typescript
await venice.keys.revoke('api-key-id');
```

## Get Rate Limits

```typescript
const rateLimits = await venice.keys.getRateLimits();
```

## Get Rate Limit Logs

```typescript
const rateLimitLogs = await venice.keys.getRateLimitLogs();
```

## Web3 Authentication

### Generate Token

```typescript
const tokenResponse = await venice.keys.generateWeb3Token();
const token = tokenResponse.token;
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