# Deployment Guide for Venice AI SDK Demo

This guide explains how to deploy the Venice AI SDK documentation with the interactive live demo.

## Overview

The deployment consists of two parts:

1. **GitHub Pages Site**: The documentation and interactive demo UI
2. **Vercel API Proxy**: A serverless function that securely proxies API requests

## Deploying the GitHub Pages Site

The documentation site is built using GitHub Pages with Jekyll. To deploy:

1. Push your changes to the `main` branch of the repository
2. GitHub Actions will automatically build and deploy the site to GitHub Pages
3. The site will be available at `https://[username].github.io/venice-dev-tools/`

### Testing Locally

To test the documentation site locally:

```bash
cd docs
bundle install
bundle exec jekyll serve
```

This will start a local server at `http://localhost:4000/venice-dev-tools/`.

## Deploying the Vercel API Proxy

The API proxy is a Vercel serverless function project that securely proxies requests to the Venice AI API.

### Prerequisites

- A [Vercel](https://vercel.com) account
- A Venice AI API key

### Deployment Steps

1. Navigate to the proxy directory:
   ```bash
   cd vercel-api-proxy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Log in to Vercel:
   ```bash
   npx vercel login
   ```

4. Set up your API key as a Vercel secret:
   ```bash
   npx vercel secret add venice_api_key "your-api-key-here"
   ```

5. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```

6. Note the deployment URL provided by Vercel (e.g., `https://venice-demo-proxy.vercel.app`)

### Updating the Demo Frontend

After deploying the API proxy, you need to update the demo frontend to use your Vercel deployment URL:

1. Open `docs/assets/js/demo.js`
2. Find the `callProxyApi` function
3. Update the URL to match your Vercel deployment:
   ```javascript
   const callProxyApi = async (endpoint, data) => {
       try {
           const response = await fetch(`https://your-vercel-deployment-url.vercel.app/api/${endpoint}`, {
               // ...
           });
           // ...
       }
   };
   ```

4. Commit and push the changes to deploy the updated frontend

## Security Considerations

- The API key is stored as a Vercel environment variable and is never exposed to the client
- Rate limiting is implemented to prevent abuse
- Consider setting up usage limits on your Venice AI account

## Troubleshooting

### CORS Issues

If you encounter CORS issues, make sure:

1. The Vercel API proxy has the correct CORS headers
2. The frontend is using the correct URL for the API proxy

### Rate Limiting

If users report rate limit errors:

1. Check the `MAX_REQUESTS_PER_HOUR` constant in each API endpoint file
2. Consider increasing the limits if needed
3. Monitor your Venice AI API usage to ensure you're not exceeding your plan limits

### API Key Issues

If the API proxy returns "API key not configured" errors:

1. Verify that the Vercel secret was set correctly
2. Check that the environment variable is being properly accessed in the serverless functions
3. You may need to redeploy the Vercel project after setting the secret

## Maintenance

- Regularly update your Venice AI API key if it expires
- Monitor the rate limits and adjust as needed
- Keep the SDK and API proxy dependencies updated