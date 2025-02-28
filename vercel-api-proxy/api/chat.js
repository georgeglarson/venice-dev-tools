const axios = require('axios');

// Set rate limiting parameters
const MAX_REQUESTS_PER_HOUR = 20;
const requestCounts = {};
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper function to check rate limits
function checkRateLimit(ip) {
  const now = Date.now();
  
  // Clean up old entries
  Object.keys(requestCounts).forEach(key => {
    if (now - requestCounts[key].timestamp > RATE_LIMIT_WINDOW) {
      delete requestCounts[key];
    }
  });
  
  // Check if IP exists in the tracking object
  if (!requestCounts[ip]) {
    requestCounts[ip] = {
      count: 0,
      timestamp: now
    };
  }
  
  // Check if rate limit exceeded
  if (requestCounts[ip].count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  // Increment count
  requestCounts[ip].count++;
  return true;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get client IP for rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later or use your own API key.' 
    });
  }
  
  try {
    const { prompt, model, webSearch } = req.body;
    
    // Validate required parameters
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Get API key from environment variable
    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Prepare request to Venice API
    const messages = [{ role: 'user', content: prompt }];
    
    // Make request to Venice API
    const response = await axios.post('https://api.venice.ai/api/v1/chat/completions', {
      model: model || 'llama-3.3-70b',
      messages,
      venice_parameters: webSearch ? {
        enable_web_search: 'on'
      } : undefined
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    // Return the response content
    return res.status(200).json({
      content: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('Error calling Venice API:', error);
    
    // Handle API errors
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data.error || 'Error from Venice API'
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};