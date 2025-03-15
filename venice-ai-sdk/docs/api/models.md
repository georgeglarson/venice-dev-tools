# Models API

The Models API provides functionality for handling model-related operations.

## Methods

### validateModel

```typescript
validateModel(model: any): boolean
```

Validates a model object.

#### Parameters

- `model`: The model object to validate

#### Returns

A boolean indicating whether the model is valid.

### Example

```typescript
import { validateModel } from '@venice-ai/core/utils/validators/models';

const model = {
  name: 'GPT-4',
  type: 'language',
  version: '1.0'
};

const isValid = validateModel(model);
console.log(isValid); // true or false
```

### createModel

```typescript
createModel(model: any): Promise<any>
```

Creates a new model in the Venice AI API.

#### Parameters

- `model`: The model object to create

#### Returns

A promise that resolves to the response from the API.

### Example

```typescript
import { createModel } from '@venice-ai/core/api/endpoints/models';

const model = {
  name: 'GPT-4',
  type: 'language',
  version: '1.0'
};

createModel(model)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### getModel

```typescript
getModel(modelId: string): Promise<any>
```

Retrieves a model from the Venice AI API by its ID.

#### Parameters

- `modelId`: The ID of the model to retrieve

#### Returns

A promise that resolves to the model data.

### Example

```typescript
import { getModel } from '@venice-ai/core/api/endpoints/models';

const modelId = '12345';

getModel(modelId)
  .then(model => console.log(model))
  .catch(error => console.error(error));
```

### updateModel

```typescript
updateModel(modelId: string, model: any): Promise<any>
```

Updates a model in the Venice AI API by its ID.

#### Parameters

- `modelId`: The ID of the model to update
- `model`: The updated model object

#### Returns

A promise that resolves to the response from the API.

### Example

```typescript
import { updateModel } from '@venice-ai/core/api/endpoints/models';

const modelId = '12345';
const updatedModel = {
  name: 'GPT-4',
  type: 'language',
  version: '1.1'
};

updateModel(modelId, updatedModel)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### deleteModel

```typescript
deleteModel(modelId: string): Promise<any>
```

Deletes a model from the Venice AI API by its ID.

#### Parameters

- `modelId`: The ID of the model to delete

#### Returns

A promise that resolves to the response from the API.

### Example

```typescript
import { deleteModel } from '@venice-ai/core/api/endpoints/models';

const modelId = '12345';

deleteModel(modelId)
  .then(response => console.log(response))
  .catch(error => console.error(error));