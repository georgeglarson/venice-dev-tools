# Images API

The Images API provides functionality for generating and manipulating images.

## Methods

### generate

```typescript
generate(options: ImageGenerationOptions): Promise<ImageGenerationResponse>
```

Generates images based on the provided options.

#### Parameters

- `options`: The image generation options
  - `model`: The model to use for image generation (e.g., 'stable-diffusion-3')
  - `prompt`: The text prompt to generate images from
  - `n`: Number of images to generate (default: 1)
  - `size`: Size of the generated images (e.g., 1024, 512)
  - `response_format`: Format of the response (default: 'url')
  - `style`: Style of the generated images (optional)
  - `quality`: Quality of the generated images (optional)

#### Returns

A promise that resolves to the image generation response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const response = await venice.images.generate({
  model: 'stable-diffusion-3',
  prompt: 'A futuristic city with flying cars',
  n: 1,
  size: 1024
});

console.log(response.data[0].url);
```

### upscale

```typescript
upscale(options: ImageUpscaleOptions): Promise<Blob>
```

Upscales an image to a higher resolution.

#### Parameters

- `options`: The image upscale options
  - `image`: The image to upscale (as a Blob, Buffer, or URL)
  - `scale`: The scale factor (e.g., 2, 4)
  - `model`: The model to use for upscaling (optional)

#### Returns

A promise that resolves to the upscaled image as a Blob.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// Upscale an image from a file
const imageBuffer = fs.readFileSync('image.jpg');
const upscaledImage = await venice.images.upscale({
  image: imageBuffer,
  scale: 4
});

// Save the upscaled image
fs.writeFileSync('upscaled-image.jpg', Buffer.from(await upscaledImage.arrayBuffer()));
```

### edit

```typescript
edit(options: ImageEditOptions): Promise<ImageEditResponse>
```

Edits an image based on the provided options.

#### Parameters

- `options`: The image edit options
  - `image`: The image to edit (as a Blob, Buffer, or URL)
  - `prompt`: The text prompt describing the desired edits
  - `mask`: Optional mask image defining the areas to edit
  - `model`: The model to use for editing (optional)
  - `n`: Number of edited images to generate (default: 1)
  - `size`: Size of the edited images (optional)

#### Returns

A promise that resolves to the image edit response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// Edit an image from a file
const imageBuffer = fs.readFileSync('image.jpg');
const response = await venice.images.edit({
  image: imageBuffer,
  prompt: 'Add a blue sky with clouds in the background',
  n: 1
});

console.log(response.data[0].url);
```

### variation

```typescript
variation(options: ImageVariationOptions): Promise<ImageVariationResponse>
```

Creates variations of an image.

#### Parameters

- `options`: The image variation options
  - `image`: The image to create variations of (as a Blob, Buffer, or URL)
  - `n`: Number of variations to generate (default: 1)
  - `model`: The model to use for variations (optional)
  - `size`: Size of the variation images (optional)

#### Returns

A promise that resolves to the image variation response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// Create variations of an image from a file
const imageBuffer = fs.readFileSync('image.jpg');
const response = await venice.images.variation({
  image: imageBuffer,
  n: 3
});

console.log(response.data.map(img => img.url));
```

## Types

### ImageGenerationOptions

```typescript
interface ImageGenerationOptions {
  model: string;
  prompt: string;
  n?: number;
  size?: number | string;
  response_format?: 'url' | 'b64_json';
  style?: string;
  quality?: string;
  venice_parameters?: {
    [key: string]: any;
  };
}
```

### ImageGenerationResponse

```typescript
interface ImageGenerationResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
  }[];
}
```

### ImageUpscaleOptions

```typescript
interface ImageUpscaleOptions {
  image: Blob | Buffer | string;
  scale: number;
  model?: string;
}
```

### ImageEditOptions

```typescript
interface ImageEditOptions {
  image: Blob | Buffer | string;
  prompt: string;
  mask?: Blob | Buffer | string;
  model?: string;
  n?: number;
  size?: number | string;
}
```

### ImageEditResponse

```typescript
interface ImageEditResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
  }[];
}
```

### ImageVariationOptions

```typescript
interface ImageVariationOptions {
  image: Blob | Buffer | string;
  n?: number;
  model?: string;
  size?: number | string;
}
```

### ImageVariationResponse

```typescript
interface ImageVariationResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
  }[];
}