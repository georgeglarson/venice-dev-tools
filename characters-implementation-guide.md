# Characters Endpoint Implementation Guide

This guide provides detailed instructions for implementing the Characters endpoint in the Venice AI SDK.

## Step 1: Update Types

First, update the types in `venice-ai-sdk/packages/core/src/types/characters.ts`:

```typescript
/**
 * A character available in the Venice AI API
 */
export interface Character {
  name: string;
  description: string | null;
  slug: string;
  shareUrl: string | null;
  createdAt: string;
  updatedAt: string;
  webEnabled: boolean;
  adult: boolean;
  tags: string[];
  stats: {
    imports: number;
  };
}

/**
 * Response for listing available characters
 */
export interface ListCharactersResponse {
  object: 'list';
  data: Character[];
}
```

## Step 2: Update Characters Endpoint Class

Update the file `venice-ai-sdk/packages/core/src/api/endpoints/characters/index.ts`:

```typescript
import { ApiEndpoint } from '../../registry/endpoint';
import { ListCharactersResponse } from '../../../types/characters';

/**
 * API endpoint for character-related operations
 */
export class CharactersEndpoint extends ApiEndpoint {
  /**
   * Gets the base endpoint path
   * @returns The endpoint path
   */
  getEndpointPath(): string {
    return '/characters';
  }

  /**
   * List available characters
   * @returns A promise that resolves to a list of available characters
   */
  public async list(): Promise<ListCharactersResponse> {
    // Emit a request event
    this.emit('request', { type: 'characters.list' });

    // Make the API request
    const response = await this.http.get<ListCharactersResponse>(
      this.getPath('')
    );

    // Emit a response event
    this.emit('response', {
      type: 'characters.list',
      data: { count: response.data.data.length }
    });

    return response.data;
  }
}

// Default export
export default CharactersEndpoint;
```

## Step 3: Update Client Class

If the client class doesn't already have the Characters endpoint, update it in `venice-ai-sdk/packages/core/src/client.ts`:

```typescript
// Add import if not already present
import CharactersEndpoint from './api/endpoints/characters';

export class VeniceClient {
  // Add private property if not already present
  private _characters: CharactersEndpoint;

  constructor(config: VeniceClientConfig) {
    // Existing initialization
    
    // Initialize Characters endpoint if not already initialized
    this._characters = new CharactersEndpoint(this.http, this.eventManager);
  }

  // Add getter for Characters endpoint if not already present
  get characters(): CharactersEndpoint {
    return this._characters;
  }
}
```

## Step 4: Create CLI Command

Create the file `venice-ai-sdk/packages/node/src/cli/commands/characters.ts`:

```typescript
import { Command } from 'commander';
import * as chalk from 'chalk';
import { VeniceNode } from '../../venice-node';

/**
 * Register characters commands with the CLI
 */
export function registerCharactersCommands(program: Command, venice: VeniceNode): void {
  const characters = program
    .command('characters')
    .description('Interact with Venice AI characters');

  // List characters
  characters
    .command('list')
    .description('List available characters')
    .action(async () => {
      try {
        const response = await venice.characters.list();
        console.log(chalk.green('Available Characters:'));
        response.data.forEach(character => {
          console.log(chalk.cyan(`Name: ${character.name}`));
          console.log(`Slug: ${character.slug}`);
          console.log(`Description: ${character.description || 'No description'}`);
          console.log(`Tags: ${character.tags.join(', ')}`);
          console.log(`Web Enabled: ${character.webEnabled}`);
          console.log(`Adult Content: ${character.adult}`);
          console.log(`Created: ${character.createdAt}`);
          console.log(`Updated: ${character.updatedAt}`);
          console.log(`Imports: ${character.stats.imports}`);
          console.log('');
        });
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });
}
```

## Step 5: Update CLI Index

Update the CLI index file `venice-ai-sdk/packages/node/src/cli/index.ts` to register the Characters commands:

```typescript
// Add import if not already present
import { registerCharactersCommands } from './commands/characters';

// In the registerCommands function, add if not already present:
registerCharactersCommands(program, venice);
```

## Step 6: Create Example

Create the file `venice-ai-sdk/examples/characters-list.js`:

```javascript
const { VeniceNode } = require('@venice-ai/node');

async function main() {
  // Initialize the Venice AI SDK
  const venice = new VeniceNode({
    apiKey: process.env.VENICE_API_KEY
  });

  try {
    // List characters
    console.log('Listing characters:');
    const characters = await venice.characters.list();
    
    // Print character information
    characters.data.forEach(character => {
      console.log(`Name: ${character.name}`);
      console.log(`Slug: ${character.slug}`);
      console.log(`Description: ${character.description || 'No description'}`);
      console.log(`Tags: ${character.tags.join(', ')}`);
      console.log('---');
    });
    
    // Show how to use a character in a chat completion
    console.log('\nUsing a character in a chat completion:');
    console.log('Example code:');
    console.log(`
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me about yourself' }
  ],
  venice_parameters: {
    character_slug: '${characters.data[0]?.slug || 'example-character'}'
  }
});
    `);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Step 7: Update Documentation

Update the file `venice-ai-sdk/docs/api/characters.md`:

```markdown
# Characters

The Venice AI SDK provides methods for interacting with Venice AI characters.

## List Characters

```typescript
const characters = await venice.characters.list();
```

This returns a list of available characters that can be used in chat completions.

## Using Characters in Chat Completions

You can use a character in a chat completion by specifying the character slug in the `venice_parameters`:

```typescript
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me about yourself' }
  ],
  venice_parameters: {
    character_slug: 'character-slug'
  }
});
```

## Character Properties

Each character has the following properties:

- `name`: The name of the character
- `description`: A description of the character
- `slug`: The unique identifier for the character
- `shareUrl`: A URL to share the character
- `createdAt`: When the character was created
- `updatedAt`: When the character was last updated
- `webEnabled`: Whether the character is enabled for web use
- `adult`: Whether the character contains adult content
- `tags`: Tags associated with the character
- `stats`: Statistics about the character
```

## Step 8: Update Examples README

Update `venice-ai-sdk/examples/README.md` to include information about the new example:

```markdown
# Characters List (`characters-list.js`)

Demonstrates how to use the Venice AI SDK to list characters and use them in chat completions:
- Listing available characters
- Getting character details
- Using characters in chat completions