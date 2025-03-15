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