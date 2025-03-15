# Models API

The Models API provides functionality for retrieving information about available models.

## Methods

### list

```typescript
list(options?: ModelListOptions): Promise<ModelListResponse>
```

Lists the available models.

#### Parameters

- `options` (optional): Options for filtering the models
  - `type`: Filter models by type (e.g., 'text', 'image')
  - `status`: Filter models by status (e.g., 'active', 'deprecated')

#### Returns

A promise that resolves to the model list response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// List all models
const models = await venice.models.list();
console.log(models.data);

// List only text models
const textModels = await venice.models.list({ type: 'text' });
console.log(textModels.data);
```

### retrieve

```typescript
retrieve(modelId: string): Promise<ModelResponse>
```

Retrieves information about a specific model.

#### Parameters

- `modelId`: The ID of the model to retrieve

#### Returns

A promise that resolves to the model response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const model = await venice.models.retrieve('llama-3.3-70b');
console.log(model);
```

### getTraits

```typescript
getTraits(): Promise<ModelTraitsResponse>
```

Gets the available model traits.

#### Returns

A promise that resolves to the model traits response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const traits = await venice.models.getTraits();
console.log(traits.data);
```

### getCompatibility

```typescript
getCompatibility(): Promise<ModelCompatibilityResponse>
```

Gets the compatibility mapping between models and features.

#### Returns

A promise that resolves to the model compatibility response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const compatibility = await venice.models.getCompatibility();
console.log(compatibility.data);
```

## Types

### ModelListOptions

```typescript
interface ModelListOptions {
  type?: string;
  status?: string;
}
```

### ModelListResponse

```typescript
interface ModelListResponse {
  object: string;
  data: Model[];
}
```

### Model

```typescript
interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  type: string;
  status: string;
  traits: string[];
  description?: string;
  capabilities?: {
    [key: string]: boolean;
  };
  pricing?: {
    input: number;
    output: number;
    unit: string;
  };
}
```

### ModelResponse

```typescript
interface ModelResponse extends Model {
  // Same as Model
}
```

### ModelTraitsResponse

```typescript
interface ModelTraitsResponse {
  object: string;
  data: {
    id: string;
    name: string;
    description: string;
  }[];
}
```

### ModelCompatibilityResponse

```typescript
interface ModelCompatibilityResponse {
  object: string;
  data: {
    [feature: string]: {
      [modelId: string]: boolean;
    };
  };
}
```

## Finding the Right Model

Venice Dev Tools provides several ways to find the right model for your needs:

### By Type

```typescript
// Get all text models
const textModels = await venice.models.list({ type: 'text' });

// Get all image models
const imageModels = await venice.models.list({ type: 'image' });
```

### By Trait

```typescript
// Get all models
const models = await venice.models.list();

// Filter models with specific traits
const visionModels = models.data.filter(model => 
  model.traits.includes('vision')
);

const fastModels = models.data.filter(model => 
  model.traits.includes('fast-response')
);
```

### By Compatibility

```typescript
// Get compatibility mapping
const compatibility = await venice.models.getCompatibility();

// Find models compatible with a specific feature
const modelsWithFunctionCalling = Object.entries(compatibility.data.function_calling)
  .filter(([_, isCompatible]) => isCompatible)
  .map(([modelId, _]) => modelId);

console.log('Models with function calling:', modelsWithFunctionCalling);
```

## Model Selection Guide

When selecting a model, consider the following factors:

1. **Task Type**: Different models excel at different tasks (text generation, image creation, etc.)
2. **Performance**: Larger models generally produce better results but are slower and more expensive
3. **Capabilities**: Some models support special features like vision, function calling, or JSON mode
4. **Cost**: Models have different pricing tiers based on their capabilities

For most general-purpose text tasks, we recommend starting with `llama-3.3-70b` which offers a good balance of quality and performance. For vision tasks, `qwen-2.5-vl` provides excellent multimodal capabilities.