---
layout: default
title: Venice AI SDK - Live Demo
---

# Live Demo

Try out the Venice AI SDK directly in your browser. No API key required!

<div class="terminal-demo">
    <div class="terminal-header">
        <div class="terminal-buttons">
            <span class="terminal-button close"></span>
            <span class="terminal-button minimize"></span>
            <span class="terminal-button maximize"></span>
        </div>
        <div class="terminal-title">Venice AI SDK Demo</div>
    </div>
    <div class="terminal-body">
        <div class="demo-tabs">
            <button class="demo-tab active" data-tab="chat">Chat</button>
            <button class="demo-tab" data-tab="image">Image</button>
            <button class="demo-tab" data-tab="models">Models</button>
        </div>
        <div class="demo-content">
            <div class="demo-pane active" id="chat-demo">
                <h3>Chat Completion</h3>
                <div class="input-group">
                    <label for="chat-prompt">Prompt:</label>
                    <textarea id="chat-prompt" rows="3" placeholder="Enter your prompt here...">Tell me about AI in 2025</textarea>
                </div>
                <div class="input-group">
                    <label for="chat-model">Model:</label>
                    <select id="chat-model">
                        <option value="llama-3.3-70b">llama-3.3-70b</option>
                        <option value="llama-3.3-8b">llama-3.3-8b</option>
                    </select>
                </div>
                <div class="input-group checkbox">
                    <input type="checkbox" id="web-search" checked>
                    <label for="web-search">Enable web search</label>
                </div>
                <button id="chat-submit" class="demo-button">Generate Response</button>
                <div class="demo-result">
                    <h4>Response:</h4>
                    <div id="chat-result" class="result-content">
                        <p class="placeholder">Your response will appear here...</p>
                    </div>
                </div>
                <div class="demo-code">
                    <h4>Code Example:</h4>
                    <pre><code class="language-javascript" id="chat-code">
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me about AI in 2025' }
  ],
  venice_parameters: {
    enable_web_search: 'on'
  }
});

console.log(response.choices[0].message.content);
                    </code></pre>
                </div>
            </div>
            
            <div class="demo-pane" id="image-demo">
                <h3>Image Generation</h3>
                <div class="input-group">
                    <label for="image-prompt">Prompt:</label>
                    <textarea id="image-prompt" rows="3" placeholder="Describe the image you want to generate...">A futuristic city with flying cars</textarea>
                </div>
                <div class="input-group">
                    <label for="image-model">Model:</label>
                    <select id="image-model">
                        <option value="fluently-xl">fluently-xl</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="image-style">Style:</label>
                    <select id="image-style">
                        <option value="Photographic">Photographic</option>
                        <option value="3D Model">3D Model</option>
                        <option value="Digital Art">Digital Art</option>
                        <option value="Anime">Anime</option>
                        <option value="Cinematic">Cinematic</option>
                    </select>
                </div>
                <button id="image-submit" class="demo-button">Generate Image</button>
                <div class="demo-result">
                    <h4>Result:</h4>
                    <div id="image-result" class="result-content">
                        <p class="placeholder">Your image will appear here...</p>
                    </div>
                </div>
                <div class="demo-code">
                    <h4>Code Example:</h4>
                    <pre><code class="language-javascript" id="image-code">
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

const response = await venice.image.generate({
  model: 'fluently-xl',
  prompt: 'A futuristic city with flying cars',
  style_preset: 'Photographic',
  height: 1024,
  width: 1024
});

console.log(response.images[0].url);
                    </code></pre>
                </div>
            </div>
            
            <div class="demo-pane" id="models-demo">
                <h3>List Models</h3>
                <button id="models-submit" class="demo-button">List Available Models</button>
                <div class="demo-result">
                    <h4>Result:</h4>
                    <div id="models-result" class="result-content">
                        <p class="placeholder">Available models will appear here...</p>
                    </div>
                </div>
                <div class="demo-code">
                    <h4>Code Example:</h4>
                    <pre><code class="language-javascript" id="models-code">
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

const response = await venice.models.list();

console.log(response.data);
                    </code></pre>
                </div>
            </div>
        </div>
        <div class="demo-note">
            <p><strong>Note:</strong> This demo uses a rate-limited API key for demonstration purposes. 
            For production use, please <a href="https://venice.ai/settings/api" target="_blank">obtain your own API key</a>.</p>
        </div>
    </div>
</div>

## How It Works

This live demo uses a secure API proxy deployed on Vercel to make requests to the Venice AI API. The proxy:

1. Securely stores the API key as an environment variable
2. Implements rate limiting to prevent abuse
3. Handles CORS for cross-origin requests
4. Provides detailed error information

The demo interface is built with vanilla JavaScript and styled to look like a terminal to provide a developer-friendly experience.

## Try It Yourself

To use the Venice AI SDK in your own projects:

1. Install the SDK:
   ```bash
   npm install venice-dev-tools
   ```

2. Initialize with your API key:
   ```javascript
   import { VeniceAI } from 'venice-dev-tools';
   
   const venice = new VeniceAI({
     apiKey: 'your-api-key',
   });
   ```

3. Make API calls as shown in the examples above

For more examples and detailed documentation, check out the [CLI documentation](/venice-dev-tools/cli) and the [README](/venice-dev-tools/).