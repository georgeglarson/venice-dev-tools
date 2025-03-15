// Venice AI SDK Demo Component
// This script handles the interactive demo functionality

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize the demo if we're on the demo page
    const demoSection = document.querySelector('.terminal-demo');
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
            // Using the Vercel project URL (stable) instead of the deployment URL (changes with each deployment)
            const apiBaseUrl = 'https://venice-dev-tools.vercel.app/api';
            
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