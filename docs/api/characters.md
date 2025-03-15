# Characters API

The Characters API provides functionality for retrieving and interacting with pre-defined AI characters.

## Methods

### list

```typescript
list(options?: CharacterListOptions): Promise<CharacterListResponse>
```

Lists the available characters.

#### Parameters

- `options` (optional): Options for filtering the characters
  - `limit`: Maximum number of characters to return
  - `offset`: Number of characters to skip
  - `category`: Filter characters by category

#### Returns

A promise that resolves to the character list response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// List all characters
const characters = await venice.characters.list();
console.log(characters.data);

// List characters with pagination
const paginatedCharacters = await venice.characters.list({
  limit: 10,
  offset: 20
});
console.log(paginatedCharacters.data);

// List characters by category
const categoryCharacters = await venice.characters.list({
  category: 'assistant'
});
console.log(categoryCharacters.data);
```

### retrieve

```typescript
retrieve(characterId: string): Promise<CharacterResponse>
```

Retrieves information about a specific character.

#### Parameters

- `characterId`: The ID or slug of the character to retrieve

#### Returns

A promise that resolves to the character response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const character = await venice.characters.retrieve('helpful-assistant');
console.log(character);
```

### getCategories

```typescript
getCategories(): Promise<CharacterCategoriesResponse>
```

Gets the available character categories.

#### Returns

A promise that resolves to the character categories response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const categories = await venice.characters.getCategories();
console.log(categories.data);
```

## Using Characters in Chat Completions

You can use characters in chat completions by specifying the character slug in the `venice_parameters`:

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me about yourself' }
  ],
  venice_parameters: {
    character_slug: 'helpful-assistant'
  }
});

console.log(response.choices[0].message.content);
```

## Types

### CharacterListOptions

```typescript
interface CharacterListOptions {
  limit?: number;
  offset?: number;
  category?: string;
}
```

### CharacterListResponse

```typescript
interface CharacterListResponse {
  object: string;
  data: Character[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

### Character

```typescript
interface Character {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_featured: boolean;
  metadata?: {
    [key: string]: any;
  };
}
```

### CharacterResponse

```typescript
interface CharacterResponse extends Character {
  // Same as Character
}
```

### CharacterCategoriesResponse

```typescript
interface CharacterCategoriesResponse {
  object: string;
  data: {
    id: string;
    name: string;
    description: string;
  }[];
}
```

## Character Categories

Venice AI provides characters in various categories:

- **Assistant**: General-purpose helpful assistants
- **Creative**: Characters focused on creative writing and storytelling
- **Professional**: Characters with expertise in specific professional domains
- **Entertainment**: Characters designed for fun and entertainment
- **Educational**: Characters focused on teaching and learning
- **Roleplay**: Characters for immersive roleplaying experiences

## Creating Custom Characters

While the Characters API currently only provides access to pre-defined characters, you can simulate custom characters by using appropriate system messages:

```typescript
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    {
      role: 'system',
      content: 'You are a friendly space alien named Zorb from the planet Nexus. ' +
               'You're curious about Earth culture and speak with occasional alien slang. ' +
               'You find human customs fascinating but sometimes confusing.'
    },
    { role: 'user', content: 'Tell me about yourself' }
  ]
});
```

## Best Practices for Using Characters

1. **Choose the Right Character**: Select a character that matches the tone and purpose of your application
2. **Consistent Interaction**: Maintain consistency in how you interact with the character
3. **Provide Context**: Give the character enough context to generate appropriate responses
4. **Respect Character Limitations**: Some characters may be designed for specific types of interactions
5. **Combine with Other Parameters**: You can combine characters with other parameters like temperature to fine-tune responses