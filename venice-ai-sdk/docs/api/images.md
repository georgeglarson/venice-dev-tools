# Images API

The Images API provides functionality for handling image-related operations.

## Methods

### validateImage

```typescript
validateImage(image: any): boolean
```

Validates an image object.

#### Parameters

- `image`: The image object to validate

#### Returns

A boolean indicating whether the image is valid.

### Example

```typescript
import { validateImage } from '@venice-ai/core/utils/validators/images';

const image = {
  url: 'https://example.com/image.jpg',
  format: 'jpg',
  size: 1024
};

const isValid = validateImage(image);
console.log(isValid); // true or false
```

### uploadImage

```typescript
uploadImage(image: any): Promise<any>
```

Uploads an image to the Venice AI API.

#### Parameters

- `image`: The image object to upload

#### Returns

A promise that resolves to the response from the API.

### Example

```typescript
import { uploadImage } from '@venice-ai/core/api/endpoints/images';

const image = {
  url: 'https://example.com/image.jpg',
  format: 'jpg',
  size: 1024
};

uploadImage(image)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### getImage

```typescript
getImage(imageId: string): Promise<any>
```

Retrieves an image from the Venice AI API by its ID.

#### Parameters

- `imageId`: The ID of the image to retrieve

#### Returns

A promise that resolves to the image data.

### Example

```typescript
import { getImage } from '@venice-ai/core/api/endpoints/images';

const imageId = '12345';

getImage(imageId)
  .then(image => console.log(image))
  .catch(error => console.error(error));
```

### deleteImage

```typescript
deleteImage(imageId: string): Promise<any>
```

Deletes an image from the Venice AI API by its ID.

#### Parameters

- `imageId`: The ID of the image to delete

#### Returns

A promise that resolves to the response from the API.

### Example

```typescript
import { deleteImage } from '@venice-ai/core/api/endpoints/images';

const imageId = '12345';

deleteImage(imageId)
  .then(response => console.log(response))
  .catch(error => console.error(error));