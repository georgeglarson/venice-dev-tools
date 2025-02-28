// Venice AI SDK Demo Component
// This script adds an interactive demo to the documentation page

document.addEventListener('DOMContentLoaded', function() {
    // Create the demo container
    const createDemoSection = () => {
        const demoSection = document.createElement('div');
        demoSection.className = 'demo-section';
        demoSection.innerHTML = `
            <h2 id="live-demo">Live Demo</h2>
            <p>Try out the Venice AI SDK with this interactive demo. No API key required!</p>
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
        `;
        
        // Find the main content area and insert the demo section
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Insert after the first h1
            const firstH1 = mainContent.querySelector('h1');
            if (firstH1) {
                firstH1.parentNode.insertBefore(demoSection, firstH1.nextSibling);
            } else {
                mainContent.prepend(demoSection);
            }
        }
        
        return demoSection;
    };
    
    // Add demo section to the page
    const demoSection = createDemoSection();
    
    if (!demoSection) return;
    
    // Tab switching functionality
    const tabs = demoSection.querySelectorAll('.demo-tab');
    const panes = demoSection.querySelectorAll('.demo-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            // Activate the clicked tab and corresponding pane
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-demo`).classList.add('active');
        });
    });
    
    // Function to update code examples based on user inputs
    const updateChatCode = () => {
        const prompt = document.getElementById('chat-prompt').value;
        const model = document.getElementById('chat-model').value;
        const webSearch = document.getElementById('web-search').checked;
        
        const code = `const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

const response = await venice.chat.completions.create({
  model: '${model}',
  messages: [
    { role: 'user', content: '${prompt.replace(/'/g, "\\'")}' }
  ]${webSearch ? `,
  venice_parameters: {
    enable_web_search: 'on'
  }` : ''}
});

console.log(response.choices[0].message.content);`;
        
        document.getElementById('chat-code').textContent = code;
    };
    
    const updateImageCode = () => {
        const prompt = document.getElementById('image-prompt').value;
        const model = document.getElementById('image-model').value;
        const style = document.getElementById('image-style').value;
        
        const code = `const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

const response = await venice.image.generate({
  model: '${model}',
  prompt: '${prompt.replace(/'/g, "\\'")}',
  style_preset: '${style}',
  height: 1024,
  width: 1024
});

console.log(response.images[0].url);`;
        
        document.getElementById('image-code').textContent = code;
    };
    
    // Add event listeners to inputs to update code examples
    document.getElementById('chat-prompt').addEventListener('input', updateChatCode);
    document.getElementById('chat-model').addEventListener('change', updateChatCode);
    document.getElementById('web-search').addEventListener('change', updateChatCode);
    
    document.getElementById('image-prompt').addEventListener('input', updateImageCode);
    document.getElementById('image-model').addEventListener('change', updateImageCode);
    document.getElementById('image-style').addEventListener('change', updateImageCode);
    
    // Function to show loading state
    const setLoading = (elementId, isLoading) => {
        const element = document.getElementById(elementId);
        if (isLoading) {
            element.innerHTML = '<div class="loading-spinner"></div><p>Loading...</p>';
        }
    };
    
    // Function to handle API calls through the proxy
    const callProxyApi = async (endpoint, data) => {
        try {
            // You can update this URL to your own Vercel deployment
            // If you deployed to the root of your project, use: https://your-project-name.vercel.app/api/
            // If you deployed to the vercel-api-proxy folder, use: https://your-project-name.vercel.app/vercel-api-proxy/api/
            const apiBaseUrl = 'https://venice-dev-tools-mvd3r9yhf-georgeglarsons-projects.vercel.app/api';
            
            const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    };
    
    // Chat submission handler
    document.getElementById('chat-submit').addEventListener('click', async () => {
        const resultElement = document.getElementById('chat-result');
        const prompt = document.getElementById('chat-prompt').value;
        const model = document.getElementById('chat-model').value;
        const webSearch = document.getElementById('web-search').checked;
        
        if (!prompt.trim()) {
            resultElement.innerHTML = '<p class="error">Please enter a prompt</p>';
            return;
        }
        
        try {
            setLoading('chat-result', true);
            
            const data = await callProxyApi('chat', {
                prompt,
                model,
                webSearch
            });
            
            resultElement.innerHTML = `<div class="response-content">${data.content.replace(/\n/g, '<br>')}</div>`;
        } catch (error) {
            resultElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });
    
    // Image submission handler
    document.getElementById('image-submit').addEventListener('click', async () => {
        const resultElement = document.getElementById('image-result');
        const prompt = document.getElementById('image-prompt').value;
        const model = document.getElementById('image-model').value;
        const style = document.getElementById('image-style').value;
        
        if (!prompt.trim()) {
            resultElement.innerHTML = '<p class="error">Please enter a prompt</p>';
            return;
        }
        
        try {
            setLoading('image-result', true);
            
            const data = await callProxyApi('image', {
                prompt,
                model,
                style
            });
            
            resultElement.innerHTML = `
                <div class="image-result">
                    <img src="${data.url}" alt="${prompt}" />
                </div>
            `;
        } catch (error) {
            resultElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });
    
    // Models submission handler
    document.getElementById('models-submit').addEventListener('click', async () => {
        const resultElement = document.getElementById('models-result');
        
        try {
            setLoading('models-result', true);
            
            const data = await callProxyApi('models', {});
            
            let modelsHtml = '<table class="models-table"><thead><tr><th>ID</th><th>Name</th><th>Type</th></tr></thead><tbody>';
            
            data.models.forEach(model => {
                modelsHtml += `<tr><td>${model.id}</td><td>${model.name}</td><td>${model.type}</td></tr>`;
            });
            
            modelsHtml += '</tbody></table>';
            resultElement.innerHTML = modelsHtml;
        } catch (error) {
            resultElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });
});