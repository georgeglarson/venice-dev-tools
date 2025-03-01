---
layout: default
title: Venice AI SDK - Character Interaction
---

# Character Interaction

The Venice AI SDK provides powerful capabilities for interacting with AI characters - predefined personalities that can enhance your conversational experiences. This guide explains how to use characters through both the CLI and programmatic interfaces.

## What are Characters?

Characters are predefined AI personalities with unique traits, knowledge, and conversational styles. They allow you to create more engaging and specialized interactions for different use cases.

## Using the CLI for Character Interaction

### Listing Available Characters

To see what characters are available:

```bash
venice list-characters
```

Options:
- `--limit <number>`: Limit the number of characters displayed
- `--raw`: Output raw JSON data (useful for scripting)

Example output:
```
Available Characters:
Total characters: 623
┌─────────┬───────────────────────────┬─────────────────────────┬───────────────────────────────────────────────┬──────────────────┐
│ (index) │ name                      │ slug                    │ description                                   │ model            │
├─────────┼───────────────────────────┼─────────────────────────┼───────────────────────────────────────────────┼──────────────────┤
│ 0       │ 'Sophia "Sophie" Daniels' │ 'sophia-sophie-daniels' │ 'Sophia "Sophie" Daniels is the quintesse...' │ 'llama-3.3-70b'  │
│ 1       │ 'Anna'                    │ 'anna'                  │ 'We all need a mommy sometimes...'            │ 'llama-3.1-405b' │
│ 2       │ 'Salma Hayek'             │ 'salma-hayek'           │ 'Famous Mexican actress a Hollywood star...'  │ 'llama-3.1-405b' │
└─────────┴───────────────────────────┴─────────────────────────┴───────────────────────────────────────────────┴──────────────────┘
```

### Chatting with a Character

To chat with a specific character, use the `chat` command with a special model parameter format:

```bash
venice chat "Your message here" --model character:character-slug
```

For example, to chat with the "Sophia" character:

```bash
venice chat "Tell me about yourself" --model character:sophia-sophie-daniels
```

This tells the API to use the specified character's personality and context for the response.

### Filtering Characters

You can filter characters when listing them:

```bash
# List only the first 5 characters
venice list-characters --limit 5

# Get raw JSON output for scripting
venice list-characters --raw
```

## Programmatic Character Interaction

For JavaScript/TypeScript applications, you can interact with characters programmatically:

### Using the CLI-style Interface

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function interactWithCharacters() {
  try {
    // List all characters
    const allCharacters = await venice.cli('list-characters');
    console.log(`Found ${allCharacters.total} characters`);
    
    // List characters with a limit
    const limitedCharacters = await venice.cli('list-characters --limit 3');
    console.log(`Showing ${limitedCharacters.filtered} of ${limitedCharacters.total} characters`);
    
    // Get raw character data for scripting
    const rawCharacters = await venice.cli('list-characters --raw --limit 2');
    const characterSlug = rawCharacters.data[0].slug;
    
    // Chat with a specific character
    const chatResponse = await venice.cli(`chat "Tell me about yourself" --model character:${characterSlug}`);
    console.log('Character response:', chatResponse);
    
    // Using object arguments instead of string arguments
    const moreCharacters = await venice.cli('list-characters', {
      limit: 5,
      raw: true
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Using the Programmatic Commands Interface

```javascript
const { VeniceAI } = require('venice-dev-tools');
const { commands } = require('venice-dev-tools/cli');

// Initialize the client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function interactWithCharacters() {
  try {
    // List characters with the commands interface
    const programmaticCharacters = await commands.listCharacters({
      limit: 3
    });
    
    console.log(`Found ${programmaticCharacters.characters.length} characters`);
    
    // Chat with a character
    const characterSlug = programmaticCharacters.characters[0].slug;
    const chatResponse = await commands.chat("Tell me about yourself", {
      model: `character:${characterSlug}`
    });
    
    console.log('Character response:', chatResponse);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Direct API Usage

For more control, you can use the API directly:

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function interactWithCharacters() {
  try {
    // List all characters
    const characters = await venice.characters.list();
    
    // Get a specific character by slug
    const characterSlug = characters.data[0].slug;
    
    // Chat with the character using the API directly
    const response = await venice.chat.completions.create({
      model: "default",
      messages: [
        { role: "user", content: "Tell me about yourself" }
      ],
      venice_parameters: {
        character_slug: characterSlug
      }
    });
    
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Advanced Character Interaction

### Combining Characters with Web Search

You can combine character interaction with web search capabilities:

```bash
venice chat "What's happening in the world today?" --model character:news-anchor --web-search
```

```javascript
const response = await venice.chat.completions.create({
  model: "default",
  messages: [
    { role: "user", content: "What's happening in the world today?" }
  ],
  venice_parameters: {
    character_slug: "news-anchor",
    enable_web_search: "on"
  }
});
```

### Character-Specific System Messages

You can provide additional system messages to guide the character's responses:

```bash
venice chat "Tell me a story" --model character:storyteller --system "Keep it short and suitable for children"
```

```javascript
const response = await venice.chat.completions.create({
  model: "default",
  messages: [
    { role: "system", content: "Keep it short and suitable for children" },
    { role: "user", content: "Tell me a story" }
  ],
  venice_parameters: {
    character_slug: "storyteller"
  }
});
```

### Using Characters with Vision and Document Analysis

Characters can analyze images and HTML documents:

```bash
# Analyze an image with a character
venice vision-chat "What do you see in this image?" --image path/to/image.jpg --character spiderman

# Analyze an HTML document with a character
venice vision-chat "Summarize this document" --image path/to/document.html --character professor
```

```javascript
// Analyze an HTML document with a character
const fs = require('fs');
const htmlBuffer = fs.readFileSync('path/to/document.html');
const base64Html = htmlBuffer.toString('base64');

const response = await venice.chat.completions.create({
  model: "qwen-2.5-vl",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Summarize this document" },
        { type: "image_url", image_url: { url: `data:text/html;base64,${base64Html}` } }
      ]
    }
  ],
  venice_parameters: {
    character_slug: "professor"
  }
});
```

## Best Practices

1. **Choose the Right Character**: Select a character that matches your use case and desired tone.
2. **Provide Clear Instructions**: Be specific in your prompts to get the most relevant responses.
3. **Use System Messages**: For more control, include system messages to guide the character's behavior.
4. **Combine with Other Features**: Characters work well with other features like web search for enhanced capabilities.

## Troubleshooting

### Character Not Found

If you receive a "Character not found" error:
- Verify the character slug is correct
- Check if the character is available in your account
- Ensure you have the necessary permissions

### Unexpected Responses

If a character's responses don't match expectations:
- Try providing more context in your prompt
- Use system messages to guide the character's behavior
- Consider using a different character that better matches your needs