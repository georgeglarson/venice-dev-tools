# AI Agent Integration Guide

This guide explains how AI agents can interact with the Venice AI SDK programmatically.

## Table of Contents

- [Overview](#overview)
- [SDK Metadata API](#sdk-metadata-api)
- [Error Recovery Automation](#error-recovery-automation)
- [Capability Discovery](#capability-discovery)
- [Code Generation](#code-generation)
- [Best Practices](#best-practices)

## Overview

The Venice AI SDK is designed to be AI-agent friendly with:

- **Machine-readable metadata**: Structured JSON describing all capabilities
- **Error recovery hints**: Automated recovery suggestions with code
- **Predictable API structure**: Consistent patterns across endpoints
- **Type safety**: Full TypeScript definitions
- **Self-documenting errors**: Errors include fix instructions

## SDK Metadata API

### Get Complete Metadata

```typescript
import { getSDKMetadata } from '@venice/core';

const metadata = getSDKMetadata();

console.log(JSON.stringify(metadata, null, 2));
```

**Output structure:**
```json
{
  "version": "2025.11.6",
  "capabilities": [...],
  "errorCodes": {...},
  "models": {...}
}
```

### Capability Discovery

```typescript
import { getCapability, getCapabilitiesByCategory } from '@venice/core';

// Get specific capability
const chatCap = getCapability('chat_completion');
console.log(chatCap.example);       // Code example
console.log(chatCap.parameters);    // Parameter schema

// Get all chat capabilities
const chatCaps = getCapabilitiesByCategory('chat');
```

### Export for AI Processing

```typescript
import { exportMetadataJSON } from '@venice/core';

// Get metadata as JSON string
const json = exportMetadataJSON();
fs.writeFileSync('sdk-metadata.json', json);
```

## Error Recovery Automation

### Detect Recoverable Errors

```typescript
import { VeniceError } from '@venice/core';

function canAutoRecover(error: unknown): boolean {
  if (error instanceof VeniceError) {
    return error.recoveryHints.some(hint => hint.automated);
  }
  return false;
}
```

### Execute Automated Recovery

```typescript
async function autoRecoverAndRetry(
  error: VeniceError,
  requestFn: () => Promise<any>
): Promise<any> {
  const automatedHints = error.recoveryHints.filter(h => h.automated);
  
  if (automatedHints.length === 0) {
    throw error; // Cannot auto-recover
  }
  
  const hint = automatedHints[0];
  
  // Execute recovery action
  if (hint.action === 'wait_and_retry' && error.code === 'RATE_LIMIT_EXCEEDED') {
    const retryAfter = (error as any).retryAfter || 60;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return requestFn(); // Retry
  }
  
  if (hint.action === 'retry_request') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return requestFn(); // Retry
  }
  
  throw error;
}
```

### Extract Recovery Code

```typescript
function getRecoveryCode(error: VeniceError): string[] {
  return error.recoveryHints
    .filter(h => h.code)
    .map(h => h.code!);
}

// Example usage
try {
  await client.chat.completions.create({ ... });
} catch (error) {
  if (error instanceof VeniceError) {
    const codes = getRecoveryCode(error);
    console.log('Recovery code suggestions:');
    codes.forEach((code, i) => {
      console.log(`\n${i + 1}. ${code}`);
    });
  }
}
```

## Capability Discovery

### List All Capabilities

```typescript
import { getSDKMetadata } from '@venice/core';

const metadata = getSDKMetadata();

metadata.capabilities.forEach(cap => {
  console.log(`${cap.id}: ${cap.description}`);
  console.log(`  Category: ${cap.category}`);
  console.log(`  Parameters: ${Object.keys(cap.parameters).join(', ')}`);
});
```

### Generate API Call from Metadata

```typescript
interface APICall {
  capability: string;
  parameters: Record<string, any>;
}

function generateSDKCall(call: APICall): string {
  const cap = getCapability(call.capability);
  if (!cap) {
    throw new Error(`Unknown capability: ${call.capability}`);
  }
  
  // Validate parameters
  for (const [name, schema] of Object.entries(cap.parameters)) {
    if (schema.required && !(name in call.parameters)) {
      throw new Error(`Missing required parameter: ${name}`);
    }
  }
  
  // Generate code
  switch (call.capability) {
    case 'chat_completion':
      return `await venice.chat.completions.create(${JSON.stringify(call.parameters, null, 2)})`;
    case 'image_generation':
      return `await venice.images.generate(${JSON.stringify(call.parameters, null, 2)})`;
    default:
      return cap.example;
  }
}

// Example
const code = generateSDKCall({
  capability: 'chat_completion',
  parameters: {
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: 'Hello!' }],
  },
});

console.log(code);
```

## Code Generation

### Generate Client Initialization

```typescript
function generateClientCode(options: {
  apiKey?: string;
  withRetry?: boolean;
  withLogging?: boolean;
}): string {
  const lines = ["import { VeniceClient } from '@venice/core';"];
  
  if (options.withLogging) {
    lines.push("import { loggingMiddleware } from '@venice/core/middleware';");
  }
  
  lines.push('');
  lines.push('const client = new VeniceClient({');
  lines.push(`  apiKey: ${options.apiKey || 'process.env.VENICE_API_KEY'},`);
  
  if (options.withRetry) {
    lines.push('  retry: {');
    lines.push('    maxRetries: 3,');
    lines.push('    initialDelayMs: 1000,');
    lines.push('    backoffMultiplier: 2,');
    lines.push('  },');
  }
  
  lines.push('});');
  
  if (options.withLogging) {
    lines.push('');
    lines.push('client.use(loggingMiddleware(client.getLogger()));');
  }
  
  return lines.join('\n');
}

console.log(generateClientCode({
  withRetry: true,
  withLogging: true,
}));
```

### Generate Error Handling

```typescript
function generateErrorHandling(capabilities: string[]): string {
  return `
try {
  const response = await client.chat.completions.create({ ... });
} catch (error) {
  if (error instanceof VeniceRateLimitError) {
    // Auto-recoverable
    const retryAfter = error.retryAfter || 60;
    await sleep(retryAfter * 1000);
    return retry();
  }
  
  if (error instanceof VeniceAuthError) {
    console.error('Authentication failed');
    error.recoveryHints.forEach(hint => {
      console.log(\`- \${hint.description}\`);
    });
    process.exit(1);
  }
  
  if (error instanceof VeniceValidationError) {
    console.error('Invalid parameters:', error.details);
    throw error;
  }
  
  throw error;
}
`.trim();
}
```

## Best Practices

### 1. Always Check Error Recoverability

```typescript
if (error instanceof VeniceError) {
  const automated = error.recoveryHints.filter(h => h.automated);
  
  if (automated.length > 0) {
    // Attempt automated recovery
    return await autoRecover(error);
  } else {
    // Requires manual intervention
    logManualSteps(error.recoveryHints);
    throw error;
  }
}
```

### 2. Use Metadata for Validation

```typescript
function validateCapabilityCall(
  capability: string,
  parameters: Record<string, any>
): { valid: boolean; errors: string[] } {
  const cap = getCapability(capability);
  if (!cap) {
    return { valid: false, errors: [`Unknown capability: ${capability}`] };
  }
  
  const errors: string[] = [];
  
  for (const [name, schema] of Object.entries(cap.parameters)) {
    if (schema.required && !(name in parameters)) {
      errors.push(`Missing required parameter: ${name}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 3. Cache SDK Metadata

```typescript
let metadataCache: SDKMetadata | null = null;

function getCachedMetadata(): SDKMetadata {
  if (!metadataCache) {
    metadataCache = getSDKMetadata();
  }
  return metadataCache;
}
```

### 4. Structure Error Reports

```typescript
interface ErrorReport {
  code: string;
  message: string;
  recoverable: boolean;
  automated: boolean;
  hints: Array<{
    action: string;
    description: string;
    code?: string;
  }>;
  context?: Record<string, any>;
}

function createErrorReport(error: VeniceError): ErrorReport {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    recoverable: error.recoveryHints.length > 0,
    automated: error.recoveryHints.some(h => h.automated),
    hints: error.recoveryHints.map(h => ({
      action: h.action,
      description: h.description,
      code: h.code,
    })),
    context: error.context,
  };
}
```

### 5. Generate SDK Documentation

```typescript
function generateCapabilityDocs(capability: SDKCapability): string {
  const lines = [
    `# ${capability.name}`,
    '',
    capability.description,
    '',
    '## Parameters',
    '',
  ];
  
  for (const [name, schema] of Object.entries(capability.parameters)) {
    lines.push(`- **${name}** (\`${schema.type}\`)${schema.required ? ' *required*' : ''}`);
    lines.push(`  ${schema.description}`);
    if (schema.default !== undefined) {
      lines.push(`  Default: \`${schema.default}\``);
    }
    lines.push('');
  }
  
  lines.push('## Example', '', '```typescript', capability.example, '```');
  
  return lines.join('\n');
}

// Generate docs for all capabilities
const metadata = getSDKMetadata();
metadata.capabilities.forEach(cap => {
  const docs = generateCapabilityDocs(cap);
  fs.writeFileSync(`docs/capabilities/${cap.id}.md`, docs);
});
```

## Complete AI Agent Example

```typescript
import { VeniceClient, getSDKMetadata, VeniceError } from '@venice/core';

class AIAgent {
  private client: VeniceClient;
  private metadata: SDKMetadata;
  
  constructor(apiKey: string) {
    this.client = new VeniceClient({
      apiKey,
      retry: {
        maxRetries: 3,
        initialDelayMs: 1000,
        backoffMultiplier: 2,
      },
    });
    
    this.metadata = getSDKMetadata();
  }
  
  async executeCapability(
    capabilityId: string,
    parameters: Record<string, any>
  ): Promise<any> {
    const cap = this.metadata.capabilities.find(c => c.id === capabilityId);
    if (!cap) {
      throw new Error(`Unknown capability: ${capabilityId}`);
    }
    
    try {
      switch (capabilityId) {
        case 'chat_completion':
          return await this.client.chat.completions.create(parameters);
        case 'image_generation':
          return await this.client.images.generate(parameters);
        case 'text_to_speech':
          return await this.client.audio.speech.create(parameters);
        case 'embeddings':
          return await this.client.embeddings.create(parameters);
        default:
          throw new Error(`Capability not implemented: ${capabilityId}`);
      }
    } catch (error) {
      if (error instanceof VeniceError) {
        return await this.handleError(error, () =>
          this.executeCapability(capabilityId, parameters)
        );
      }
      throw error;
    }
  }
  
  private async handleError(
    error: VeniceError,
    retryFn: () => Promise<any>
  ): Promise<any> {
    const automated = error.recoveryHints.filter(h => h.automated);
    
    if (automated.length === 0) {
      console.error('Manual intervention required:');
      error.recoveryHints.forEach(hint => {
        console.log(`- ${hint.description}`);
      });
      throw error;
    }
    
    console.log(`Auto-recovering from ${error.code}...`);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      const retryAfter = (error as any).retryAfter || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return retryFn();
    }
    
    if (error.code === 'NETWORK_ERROR') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryFn();
    }
    
    throw error;
  }
  
  listCapabilities(): string[] {
    return this.metadata.capabilities.map(c => c.id);
  }
  
  getCapabilityInfo(id: string) {
    return this.metadata.capabilities.find(c => c.id === id);
  }
}

// Usage
const agent = new AIAgent(process.env.VENICE_API_KEY!);

const response = await agent.executeCapability('chat_completion', {
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response);
```

## Summary

The Venice AI SDK provides AI agents with:

1. **Structured metadata** via `getSDKMetadata()`
2. **Error recovery hints** with automated/manual flags
3. **Code examples** in capability definitions
4. **Type schemas** for all parameters
5. **Predictable patterns** across all endpoints

This enables AI agents to:
- Discover capabilities programmatically
- Generate correct SDK calls
- Handle errors intelligently
- Provide user guidance
- Automate recovery when possible
