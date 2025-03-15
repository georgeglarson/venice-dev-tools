# Venice AI SDK Demo API Proxy

This is a Vercel serverless function project that serves as an API proxy for the Venice AI SDK demo. It allows users to try out the Venice AI SDK without exposing your API key.

## Features

- Proxies requests to the Venice AI API
- Securely stores your API key as a Vercel environment variable
- Implements rate limiting to prevent abuse
- Supports three endpoints:
  - `/api/chat` - For chat completions
  - `/api/image` - For image generation
  - `/api/models` - For listing available models

## Setup Instructions

### 1. Prerequisites

- A [Vercel](https://vercel.com) account
- A Venice AI API key

### 2. Deploy to Vercel

You can deploy this project to Vercel in two ways:

#### Option 1: Deploy from GitHub

1. Fork this repository to your GitHub account
2. Log in to your Vercel account
3. Click "New Project"
4. Import your forked repository
5. Configure the project:
   - Set the root directory to `vercel-api-proxy`
   - Add an environment variable:
     - Name: `VENICE_API_KEY`
     - Value: Your Venice AI API key
6. Click "Deploy"

#### Option 2: Deploy using Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Navigate to the project directory:
   ```
   cd vercel-api-proxy
   ```

4. Create a `.env` file with your API key:
   ```
   VENICE_API_KEY=your_api_key_here
   ```

5. Deploy to Vercel:
   ```
   vercel --prod
   ```

### 3. Update the Demo Frontend

After deploying, update the `callProxyApi` function in `docs/assets/js/demo.js` with your Vercel deployment URL:

```javascript
const callProxyApi = async (endpoint, data) => {
    try {
        const response = await fetch(`https://your-vercel-deployment-url.vercel.app/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Rest of the function...
    }
};
```

## Security Considerations

- Your API key is stored as a Vercel environment variable and is never exposed to the client
- Rate limiting is implemented to prevent abuse
- Consider setting up usage limits on your Venice AI account

## Customization

You can customize the rate limits by modifying the `MAX_REQUESTS_PER_HOUR` constant in each API endpoint file.

## License

MIT