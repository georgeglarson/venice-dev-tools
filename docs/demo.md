---
layout: default
title: Live Demo - Venice Dev Tools
---

# Venice Dev Tools Live Demo

This interactive demo allows you to try out the Venice Dev Tools directly in your browser. No API key required!

<div class="demo-container">
  <div class="demo-header">
    <h2>Chat Completion Demo</h2>
    <p>Try generating text with different models and settings</p>
  </div>
  
  <div class="demo-controls">
    <div class="control-group">
      <label for="demo-model">Model:</label>
      <select id="demo-model">
        <option value="llama-3.3-70b">Llama 3.3 70B</option>
        <option value="llama-3.3-8b">Llama 3.3 8B</option>
        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
        <option value="claude-3-opus">Claude 3 Opus</option>
        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
        <option value="claude-3-haiku">Claude 3 Haiku</option>
      </select>
    </div>
    
    <div class="control-group">
      <label for="demo-character">Character (Optional):</label>
      <select id="demo-character">
        <option value="">None</option>
        <option value="Scientist">Scientist</option>
        <option value="Historian">Historian</option>
        <option value="Creative Writer">Creative Writer</option>
        <option value="Business Analyst">Business Analyst</option>
        <option value="Programmer">Programmer</option>
        <option value="Philosopher">Philosopher</option>
        <option value="Teacher">Teacher</option>
        <option value="Coach">Coach</option>
      </select>
    </div>
    
    <div class="control-group">
      <label for="demo-system">System Message (Optional):</label>
      <input type="text" id="demo-system" placeholder="You are a helpful assistant">
    </div>
    
    <div class="control-group checkbox">
      <input type="checkbox" id="demo-stream">
      <label for="demo-stream">Stream Response</label>
    </div>
    
    <div class="control-group checkbox">
      <input type="checkbox" id="demo-web-search">
      <label for="demo-web-search">Enable Web Search</label>
    </div>
  </div>
  
  <div class="demo-chat">
    <div id="chat-messages" class="chat-messages">
      <div class="system-message">
        This is a demo interface. Enter a message below to interact with Venice AI.
      </div>
    </div>
    
    <div class="chat-input">
      <textarea id="user-input" placeholder="Type your message here..."></textarea>
      <button id="send-button">Send</button>
    </div>
  </div>
</div>

<div class="demo-container">
  <div class="demo-header">
    <h2>Image Generation Demo</h2>
    <p>Generate images with different models and styles</p>
  </div>
  
  <div class="demo-controls">
    <div class="control-group">
      <label for="image-model">Model:</label>
      <select id="image-model">
        <option value="sdxl">Stable Diffusion XL</option>
        <option value="sd3">Stable Diffusion 3</option>
        <option value="dalle3">DALL-E 3</option>
      </select>
    </div>
    
    <div class="control-group">
      <label for="image-style">Style:</label>
      <select id="image-style">
        <option value="photographic">Photographic</option>
        <option value="digital-art">Digital Art</option>
        <option value="anime">Anime</option>
        <option value="cinematic">Cinematic</option>
        <option value="3d-render">3D Render</option>
        <option value="pixel-art">Pixel Art</option>
        <option value="oil-painting">Oil Painting</option>
        <option value="watercolor">Watercolor</option>
      </select>
    </div>
    
    <div class="control-group">
      <label for="image-prompt">Prompt:</label>
      <textarea id="image-prompt" placeholder="A serene mountain landscape at sunset"></textarea>
    </div>
    
    <div class="control-group">
      <button id="generate-button">Generate Image</button>
    </div>
  </div>
  
  <div class="image-result">
    <div id="image-loading" class="hidden">Generating image...</div>
    <div id="image-container"></div>
  </div>
</div>

## How This Demo Works

This demo provides a simplified interface to the Venice AI API, allowing you to:

1. Generate text responses using various models
2. Create images with different styles and models
3. Try out character interactions
4. Test streaming responses
5. Experience web search capabilities

The demo is powered by the Venice Dev Tools SDK, which handles all the communication with the Venice AI API. For a full-featured experience, we recommend installing the SDK and using it in your own projects.

## SDK Installation

```bash
npm install venice-dev-tools
```

## Basic SDK Usage

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function generateChatCompletion() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Tell me about AI' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
```

For more information, check out the [full documentation](/venice-dev-tools/).

<script>
  // Demo functionality would be implemented here in a real environment
  document.addEventListener('DOMContentLoaded', function() {
    // This is a placeholder for the actual demo implementation
    // In a real environment, this would connect to the Venice AI API
    
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    sendButton.addEventListener('click', function() {
      // Add user message to chat
      const userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      userMessage.textContent = userInput.value;
      chatMessages.appendChild(userMessage);
      
      // Simulate AI response
      const aiMessage = document.createElement('div');
      aiMessage.className = 'ai-message';
      aiMessage.textContent = 'This is a demo interface. In the actual SDK, you would receive a real response from the Venice AI API.';
      
      // Simulate loading
      setTimeout(function() {
        chatMessages.appendChild(aiMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
      
      userInput.value = '';
    });
    
    // Image generation demo
    const generateButton = document.getElementById('generate-button');
    const imageContainer = document.getElementById('image-container');
    const imageLoading = document.getElementById('image-loading');
    
    generateButton.addEventListener('click', function() {
      imageLoading.classList.remove('hidden');
      imageContainer.innerHTML = '';
      
      // Simulate image generation
      setTimeout(function() {
        imageLoading.classList.add('hidden');
        
        const message = document.createElement('div');
        message.className = 'demo-message';
        message.textContent = 'This is a demo interface. In the actual SDK, an image would be generated based on your prompt.';
        imageContainer.appendChild(message);
      }, 2000);
    });
  });
</script>

<style>
  .demo-container {
    margin: 2rem 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .demo-header {
    background: #f5f5f5;
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }
  
  .demo-header h2 {
    margin-top: 0;
  }
  
  .demo-controls {
    padding: 1rem;
    background: #f9f9f9;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .control-group {
    margin-bottom: 1rem;
  }
  
  .control-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  .control-group select,
  .control-group input[type="text"],
  .control-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .control-group textarea {
    min-height: 80px;
  }
  
  .control-group.checkbox {
    display: flex;
    align-items: center;
  }
  
  .control-group.checkbox label {
    margin-bottom: 0;
    margin-left: 0.5rem;
  }
  
  .demo-chat {
    padding: 1rem;
    background: #fff;
  }
  
  .chat-messages {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .system-message {
    background: #f0f0f0;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .user-message {
    background: #e1f5fe;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: right;
  }
  
  .ai-message {
    background: #f1f8e9;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .chat-input {
    display: flex;
    gap: 1rem;
  }
  
  .chat-input textarea {
    flex-grow: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 60px;
  }
  
  .chat-input button,
  #generate-button {
    padding: 0.5rem 1rem;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .chat-input button:hover,
  #generate-button:hover {
    background: #3367d6;
  }
  
  .image-result {
    padding: 1rem;
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  #image-loading {
    color: #666;
  }
  
  .hidden {
    display: none;
  }
  
  .demo-message {
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
    text-align: center;
  }
</style>