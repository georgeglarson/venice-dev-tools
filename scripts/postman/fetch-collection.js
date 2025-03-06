#!/usr/bin/env node

/**
 * Script to fetch the Venice AI Postman collection
 * 
 * This script fetches the Venice AI Postman collection from the public workspace
 * and saves it locally. It can also extract endpoint information for use in the SDK.
 * 
 * Usage:
 *   node fetch-collection.js [--extract]
 * 
 * Options:
 *   --extract  Extract endpoint information from the collection
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Postman API URLs and authentication
const POSTMAN_API_URL = 'https://api.getpostman.com';
// Load API key from environment variable to avoid secret scanning
const POSTMAN_ENV_VAR = 'POSTMAN_API_KEY';
const POSTMAN_AUTH_KEY = process.env[POSTMAN_ENV_VAR];

// Check if API key is missing
if (!POSTMAN_AUTH_KEY) {
  console.warn(`Warning: ${POSTMAN_ENV_VAR} environment variable is not set. Some functionality may be limited.`);
  console.warn('To use the Postman API, set the environment variable:');
  console.warn('  export POSTMAN_API_KEY=your_api_key');
}
const VENICE_COLLECTION_ID = '38652128-d4701b00-292f-48a3-bfad-e26b7b6daaf9';

// Output directories
const COLLECTIONS_DIR = path.join(__dirname, '../../postman/collections');
const ENDPOINTS_DIR = path.join(__dirname, '../../postman/endpoints');

// Ensure directories exist
if (!fs.existsSync(COLLECTIONS_DIR)) {
  fs.mkdirSync(COLLECTIONS_DIR, { recursive: true });
}
if (!fs.existsSync(ENDPOINTS_DIR)) {
  fs.mkdirSync(ENDPOINTS_DIR, { recursive: true });
}

/**
 * Creates a placeholder collection when the API key is missing
 * @returns {Object} Placeholder collection object
 */
function createPlaceholderCollection() {
  const placeholderCollection = {
    info: {
      name: "Venice AI API (Placeholder)",
      description: "This is a placeholder for the actual Venice AI API collection. To get the real collection, visit https://www.postman.com/veniceai/venice-ai-workspace/",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
      {
        name: "Image",
        item: [
          {
            name: "Upscale Image",
            request: {
              method: "POST",
              url: {
                raw: "https://api.venice.ai/api/v1/image/upscale",
                protocol: "https",
                host: ["api", "venice", "ai"],
                path: ["api", "v1", "image", "upscale"]
              },
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{api_key}}",
                  type: "text"
                },
                {
                  key: "Content-Type",
                  value: "multipart/form-data",
                  type: "text"
                }
              ],
              body: {
                mode: "formdata",
                formdata: [
                  {
                    key: "model",
                    value: "upscale-model",
                    type: "text"
                  },
                  {
                    key: "scale",
                    value: "2",
                    description: "Scale factor (2 or 4)",
                    type: "text"
                  },
                  {
                    key: "image",
                    type: "file",
                    src: "/path/to/image.jpg"
                  }
                ]
              },
              description: "Upscales an image by a specified scale factor (2 or 4)"
            },
            response: []
          }
        ]
      }
    ]
  };
  
  // Save the placeholder collection
  const outputPath = path.join(COLLECTIONS_DIR, 'venice-placeholder.json');
  fs.writeFileSync(outputPath, JSON.stringify(placeholderCollection, null, 2));
  console.log(`Placeholder collection saved to: ${outputPath}`);
  
  return placeholderCollection;
}

/**
 * Fetches the Venice AI Postman collection
 */
async function fetchCollection() {
  try {
    console.log('Fetching Venice AI Postman collection...');
    
    // Check if API key is available
    if (!POSTMAN_AUTH_KEY) {
      console.log('No Postman API key found. Checking for local collection file...');
      
      // Check if we already have a local copy
      const localPath = path.join(COLLECTIONS_DIR, 'venice.json');
      if (fs.existsSync(localPath)) {
        console.log('Using existing local collection file.');
        try {
          const fileContent = fs.readFileSync(localPath, 'utf8');
          return JSON.parse(fileContent);
        } catch (readError) {
          console.error(`Error reading local collection: ${readError.message}`);
        }
      }
      
      console.log('No local collection found. Using placeholder collection as fallback.');
      return createPlaceholderCollection();
    }
    
    // Use the Postman API to get the specific collection
    const headers = {
      'X-Api-Key': POSTMAN_AUTH_KEY
    };
    
    try {
      // Directly fetch the Venice collection using the collection ID
      console.log(`Fetching collection ${VENICE_COLLECTION_ID} from Postman API...`);
      const collectionResponse = await axios.get(`${POSTMAN_API_URL}/collections/${VENICE_COLLECTION_ID}`, { headers });
      
      if (collectionResponse.data && collectionResponse.data.collection) {
        const collection = collectionResponse.data.collection;
        console.log(`Successfully fetched collection: ${collection.info.name}`);
        
        // Save the collection temporarily for extraction
        const outputPath = path.join(COLLECTIONS_DIR, 'venice.json');
        fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
        console.log(`Collection temporarily saved to: ${outputPath}`);
        
        // If we're extracting endpoints, we'll delete this file later
        // to save space, as it's very large
        const shouldDeleteLater = process.argv.includes('--extract');
        if (shouldDeleteLater) {
          console.log('Will delete large venice.json file after extraction');
        }
        
        return { collection, tempFilePath: outputPath, shouldDeleteLater };
      } else {
        throw new Error('Invalid collection data received');
      }
    } catch (apiError) {
      console.error('Error accessing Postman API:', apiError.message);
      if (apiError.response) {
        console.error('Status:', apiError.response.status);
        console.error('Response:', JSON.stringify(apiError.response.data, null, 2));
      }
      
      // Check if we already have a local copy
      const localPath = path.join(COLLECTIONS_DIR, 'venice.json');
      if (fs.existsSync(localPath)) {
        console.log('Using existing local collection file instead.');
        try {
          const fileContent = fs.readFileSync(localPath, 'utf8');
          return JSON.parse(fileContent);
        } catch (readError) {
          console.error(`Error reading local collection: ${readError.message}`);
        }
      }
      
      console.log('Using placeholder collection as fallback.');
      return createPlaceholderCollection();
    }
  } catch (error) {
    console.error('Error fetching collection:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Extracts endpoint information from a Postman collection
 *
 * @param {Object} collection - Postman collection object
 */
/**
 * Creates a minimal version of an endpoint with only essential information
 *
 * @param {Object} endpoint - Full endpoint object
 * @returns {Object} - Minimal endpoint object
 */
function createMinimalEndpoint(endpoint) {
  return {
    name: endpoint.name,
    method: endpoint.method,
    path: endpoint.path
  };
}

/**
 * Creates a compact version of an endpoint with moderate detail
 *
 * @param {Object} endpoint - Full endpoint object
 * @returns {Object} - Compact endpoint object
 */
function createCompactEndpoint(endpoint) {
  return {
    name: endpoint.name,
    method: endpoint.method,
    path: endpoint.path,
    url: endpoint.url,
    description: endpoint.description,
    parameters: endpoint.parameters.map(p => ({
      name: p.name,
      required: p.required,
      type: p.type
    }))
  };
}

/**
 * Truncates base64 image data in a string
 *
 * @param {string} str - String that might contain base64 image data
 * @returns {string} - String with truncated base64 image data
 */
function truncateBase64Images(str) {
  if (typeof str !== 'string') return str;
  
  // If the string is very large, be extremely aggressive
  if (str.length > 10000) {
    // For extremely large strings, just return a brief summary
    return `[Large content truncated - ${str.length} bytes]`;
  }
  
  // For moderately large strings, be more aggressive
  if (str.length > 1000) {
    // Check if it looks like JSON
    if ((str.startsWith('{') && str.endsWith('}')) ||
        (str.startsWith('[') && str.endsWith(']'))) {
      try {
        // Try to parse as JSON and stringify with limited depth
        const parsed = JSON.parse(str);
        return JSON.stringify(parsed, (key, value) => {
          if (typeof value === 'string' && value.length > 100) {
            return `[String truncated - ${value.length} bytes]`;
          }
          return value;
        }, 2);
      } catch (e) {
        // Not valid JSON, continue with normal truncation
      }
    }
  }
  
  // Common patterns for base64 image data
  const patterns = [
    // Standard data URI format for images
    /data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/g,
    // Base64 prefix followed by long base64 string
    /base64,[a-zA-Z0-9+/=]{50,}/g, // More aggressive (50+ chars)
    // Long base64 strings (likely to be images or binary data)
    /[a-zA-Z0-9+/=]{200,}/g, // More aggressive (200+ chars)
    // Common image formats in base64 (JPEG, PNG, GIF, WebP, SVG)
    /iVBOR[a-zA-Z0-9+/=]{50,}/g,  // PNG
    /R0lGOD[a-zA-Z0-9+/=]{50,}/g, // GIF
    /\/9j\/[a-zA-Z0-9+/=]{50,}/g, // JPEG
    /UklGR[a-zA-Z0-9+/=]{50,}/g,  // WebP
    /PHN2Z[a-zA-Z0-9+/=]{50,}/g   // SVG
  ];
  
  let result = str;
  for (const pattern of patterns) {
    result = result.replace(pattern, (match) => {
      // For data URI format, preserve the prefix
      if (match.includes('base64,')) {
        const prefix = match.substring(0, match.indexOf('base64,') + 7);
        return `${prefix}[...]`;
      }
      // For other patterns, just use ellipsis
      return `[...]`;
    });
  }
  
  // Also truncate any long text that might not be base64
  if (result.length > 500) {
    return result.substring(0, 100) + '...';
  }
  
  return result;
}

/**
 * Recursively processes an object to truncate base64 image data
 *
 * @param {any} obj - Object to process
 * @returns {any} - Processed object with truncated base64 image data
 */
function truncateImagesInObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return truncateBase64Images(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => truncateImagesInObject(item));
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = truncateImagesInObject(value);
    }
    return result;
  }
  
  return obj;
}

/**
 * Checks if an endpoint object is large
 *
 * @param {Object} endpoint - Endpoint object
 * @returns {boolean} - True if the endpoint is considered large
 */
function isLargeEndpoint(endpoint) {
  const size = JSON.stringify(endpoint).length;
  return size > 1000; // Even more aggressive - consider endpoints larger than 1KB as "large"
}

/**
 * Checks if a string likely contains base64 encoded data
 *
 * @param {string} str - String to check
 * @returns {boolean} - True if the string likely contains base64 data
 */
function containsBase64Data(str) {
  if (typeof str !== 'string') return false;
  
  // Check for common base64 patterns
  return (
    str.includes('base64,') ||
    /[a-zA-Z0-9+/=]{100,}/.test(str) ||
    /iVBOR/.test(str) || // PNG
    /R0lGOD/.test(str) || // GIF
    /\/9j\//.test(str) || // JPEG
    /UklGR/.test(str) || // WebP
    /PHN2Z/.test(str)    // SVG
  );
}

/**
 * Extracts endpoint information from a Postman collection
 *
 * @param {Object} collection - Postman collection object
 */
function extractEndpoints(collection) {
  console.log('Extracting endpoints from collection...');
  
  // First, process the collection to truncate any base64 image data
  console.log('Truncating base64 image data in collection...');
  const processedCollection = truncateImagesInObject(collection);
  
  // Create a flat structure of endpoints
  const endpoints = [];
  
  // Function to recursively process collection items
  function processItems(items, parentName = '') {
    items.forEach(item => {
      const itemName = parentName ? `${parentName}/${item.name}` : item.name;
      
      if (item.request) {
        // This is an endpoint
        // Create a minimal endpoint object with only essential information
        const endpoint = {
          id: endpoints.length, // Add a unique ID for reference
          name: item.name,
          path: itemName,
          method: item.request.method,
          url: item.request.url.raw,
          description: item.request.description || '',
        };
        
        // Extract URL parameters (minimal info)
        if (item.request.url.query) {
          endpoint.parameters = item.request.url.query.map(param => ({
            name: param.key,
            required: param.disabled ? false : true,
          }));
        } else {
          endpoint.parameters = [];
        }
        
        // Extract API path for categorization
        let urlPath = '';
        if (item.request.url.path && Array.isArray(item.request.url.path)) {
          urlPath = item.request.url.path.join('/');
        } else if (typeof item.request.url.raw === 'string') {
          try {
            const url = new URL(item.request.url.raw.replace(/{{[^}]+}}/g, 'placeholder'));
            urlPath = url.pathname.replace(/^\//, '');
          } catch (e) {
            const match = item.request.url.raw.match(/\/([^?]+)/);
            if (match) {
              urlPath = match[1];
            }
          }
        }
        
        // Extract resource type (first path component)
        if (urlPath) {
          const pathParts = urlPath.split('/');
          endpoint.resource = pathParts[0] || 'uncategorized';
          
          // Add second path component if it exists and isn't a parameter
          if (pathParts[1] && !pathParts[1].includes('{')) {
            endpoint.resource += `/${pathParts[1]}`;
          }
        } else {
          endpoint.resource = 'uncategorized';
        }
        
        // Extract category from folder structure
        endpoint.category = itemName.split('/')[0] || 'Uncategorized';
        
        // Add request details with truncated content
        endpoint.details = {
          headers: item.request.header || [],
        };
        
        // Handle body content with aggressive truncation
        if (item.request.body) {
          if (item.request.body.mode === 'raw' && item.request.body.raw) {
            // Truncate raw body content
            const rawContent = item.request.body.raw;
            endpoint.details.body = {
              mode: 'raw',
              type: item.request.body.options?.raw?.language || 'text',
              content: rawContent.length > 100 ?
                rawContent.substring(0, 100) + '...' :
                rawContent
            };
          } else if (item.request.body.mode === 'formdata' && item.request.body.formdata) {
            // Simplify formdata to just show field names and types
            endpoint.details.body = {
              mode: 'formdata',
              fields: item.request.body.formdata.map(field => ({
                key: field.key,
                type: field.type,
                required: !field.disabled
              }))
            };
          }
        }
        
        endpoints.push(endpoint);
      }
      
      // Process nested items
      if (item.item && item.item.length > 0) {
        processItems(item.item, itemName);
      }
    });
  }
  
  // Process all items in the processed collection
  if (processedCollection.item && processedCollection.item.length > 0) {
    processItems(processedCollection.item);
  }
  
  // Create a simple, flat output structure
  
  // 1. Create a single endpoints directory
  const endpointsDir = ENDPOINTS_DIR;
  if (!fs.existsSync(endpointsDir)) {
    fs.mkdirSync(endpointsDir, { recursive: true });
  }
  
  // Create a function to generate consistent filenames
  const getEndpointFilename = (endpoint) => {
    let filename = `${endpoint.method.toLowerCase()}-${endpoint.name.toLowerCase()}`
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 80);
    
    return filename;
  };
  
  // Track filename usage for handling duplicates
  const filenameUsage = {};
  const getUniqueFilename = (baseFilename) => {
    if (filenameUsage[baseFilename]) {
      filenameUsage[baseFilename]++;
      return `${baseFilename}-${filenameUsage[baseFilename]}`;
    } else {
      filenameUsage[baseFilename] = 1;
      return baseFilename;
    }
  };
  
  // Assign unique filenames to each endpoint
  endpoints.forEach(endpoint => {
    const baseFilename = getEndpointFilename(endpoint);
    endpoint.filename = getUniqueFilename(baseFilename);
  });
  
  // 2. Create a main index file that lists all endpoints with minimal info
  const indexData = {
    count: endpoints.length,
    endpoints: endpoints.map(e => ({
      filename: e.filename,
      name: e.name,
      method: e.method,
      resource: e.resource,
      category: e.category,
      url: e.url
    }))
  };
  
  const indexPath = path.join(endpointsDir, 'endpoints.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`Created main endpoint index at: ${indexPath}`);
  
  // 3. Create a resources.json file that organizes endpoints by resource
  const resourcesMap = {};
  endpoints.forEach(endpoint => {
    if (!resourcesMap[endpoint.resource]) {
      resourcesMap[endpoint.resource] = [];
    }
    resourcesMap[endpoint.resource].push(endpoint.filename);
  });
  
  const resourcesPath = path.join(endpointsDir, 'resources.json');
  fs.writeFileSync(resourcesPath, JSON.stringify(resourcesMap, null, 2));
  console.log(`Created resources index at: ${resourcesPath}`);
  
  // 4. Create a categories.json file that organizes endpoints by category
  const categoriesMap = {};
  endpoints.forEach(endpoint => {
    if (!categoriesMap[endpoint.category]) {
      categoriesMap[endpoint.category] = [];
    }
    categoriesMap[endpoint.category].push(endpoint.filename);
  });
  
  const categoriesPath = path.join(endpointsDir, 'categories.json');
  fs.writeFileSync(categoriesPath, JSON.stringify(categoriesMap, null, 2));
  console.log(`Created categories index at: ${categoriesPath}`);
  
  // 5. Save individual endpoint details with meaningful filenames
  const detailsDir = path.join(endpointsDir, 'endpoints');
  if (!fs.existsSync(detailsDir)) {
    fs.mkdirSync(detailsDir, { recursive: true });
  }
  
  // Save each endpoint with its assigned filename
  endpoints.forEach(endpoint => {
    const detailPath = path.join(detailsDir, `${endpoint.filename}.json`);
    fs.writeFileSync(detailPath, JSON.stringify(endpoint, null, 2));
  });
  
  console.log(`Saved ${endpoints.length} individual endpoint details with meaningful filenames to: ${detailsDir}`);
  
  return endpoints;
}

/**
 * Recursively removes all files in a directory
 *
 * @param {string} dirPath - Path to the directory to clean
 */
function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively clean subdirectories
      cleanDirectory(fullPath);
      
      // Remove empty directories
      const subEntries = fs.readdirSync(fullPath);
      if (subEntries.length === 0) {
        fs.rmdirSync(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Remove JSON files
      console.log(`Removing old file: ${fullPath}`);
      fs.unlinkSync(fullPath);
    }
  }
}

/**
 * Cleans the endpoints directory to remove old files
 */
function cleanEndpointsDirectory() {
  console.log('Cleaning endpoints directory...');
  
  // Remove all files in the endpoints directory and its subdirectories
  if (fs.existsSync(ENDPOINTS_DIR)) {
    console.log('Removing all files from endpoints directory...');
    
    // Clean top-level JSON files
    const files = fs.readdirSync(ENDPOINTS_DIR);
    for (const file of files) {
      const filePath = path.join(ENDPOINTS_DIR, file);
      if (file.endsWith('.json')) {
        console.log(`Removing old file: ${filePath}`);
        fs.unlinkSync(filePath);
      } else if (fs.statSync(filePath).isDirectory()) {
        // Recursively clean all subdirectories
        console.log(`Cleaning subdirectory: ${file}`);
        cleanDirectory(filePath);
      }
    }
  }
  
  // Ensure main directory exists
  if (!fs.existsSync(ENDPOINTS_DIR)) {
    fs.mkdirSync(ENDPOINTS_DIR, { recursive: true });
  }
  
  // Ensure endpoints directory exists
  const endpointsDir = path.join(ENDPOINTS_DIR, 'endpoints');
  if (!fs.existsSync(endpointsDir)) {
    fs.mkdirSync(endpointsDir, { recursive: true });
  }
  
  console.log('Endpoints directory cleaned successfully.');
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const extractEndpointsFlag = process.argv.includes('--extract');
    const forceFlag = process.argv.includes('--force');
    
    // Fetch the collection
    const result = await fetchCollection();
    const collection = result.collection || result; // Handle both new and old return formats
    let tempFilePath = result.tempFilePath;
    let shouldDeleteLater = result.shouldDeleteLater;
    
    // Extract endpoints if requested
    if (extractEndpointsFlag) {
      // Clean up old files first
      cleanEndpointsDirectory();
      
      // Extract endpoints
      extractEndpoints(collection);
      
      // Delete the large venice.json file if it was created
      if (shouldDeleteLater && tempFilePath && fs.existsSync(tempFilePath)) {
        console.log(`Deleting large temporary file: ${tempFilePath}`);
        fs.unlinkSync(tempFilePath);
        console.log('Large venice.json file deleted successfully');
      }
      
      // Process all JSON files to replace excessive data with ellipses
      console.log('Processing extracted files to reduce size...');
      processExtractedFiles();
    }
    
    console.log('\nNext steps:');
    console.log('1. You can run this script periodically to fetch the latest Venice AI Postman collection');
    console.log('2. Use the --extract flag to update the endpoint information');
    console.log('3. Use --force to force re-download even if local file exists');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

/**
 * Process all extracted JSON files to replace excessive data with ellipses
 */
function processExtractedFiles() {
  // Process files in the endpoints directory
  processDirectory(ENDPOINTS_DIR);
  console.log('All extracted files processed successfully');
}

/**
 * Recursively process all JSON files in a directory
 * @param {string} dirPath - Directory path to process
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Process JSON files
      processJsonFile(fullPath);
    }
  }
}

/**
 * Process a JSON file to replace excessive data with ellipses
 * @param {string} filePath - Path to the JSON file
 */
function processJsonFile(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip very small files
    if (content.length < 1000) return;
    
    console.log(`Processing file: ${filePath}`);
    
    let processed = content;
    
    // For extremely large files, be even more aggressive
    if (content.length > 10000) {
      console.log(`  Aggressive truncation for very large file (${content.length} bytes)`);
      
      try {
        // Try to parse as JSON and aggressively truncate
        const parsed = JSON.parse(content);
        
        // Recursively process the object to truncate all large strings
        const truncateRecursive = (obj) => {
          if (obj === null || obj === undefined) return obj;
          
          if (typeof obj === 'string') {
            if (obj.length > 100) {
              return obj.substring(0, 50) + '...';
            }
            return obj;
          }
          
          if (Array.isArray(obj)) {
            return obj.map(item => truncateRecursive(item));
          }
          
          if (typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
              result[key] = truncateRecursive(value);
            }
            return result;
          }
          
          return obj;
        };
        
        const truncated = truncateRecursive(parsed);
        processed = JSON.stringify(truncated, null, 2);
        
        // Write the processed content back to the file
        fs.writeFileSync(filePath, processed);
        return;
      } catch (e) {
        // Not valid JSON, continue with regex replacements
        console.log(`  Could not parse as JSON, using regex replacements`);
      }
    }
    
    // Use sed-like replacement for large base64 data and other content
    processed = processed
      // Base64 image data
      .replace(/(data:image\/[^;]+;base64,)[a-zA-Z0-9+/=]{50,}/g, '$1[...]')
      .replace(/("url": "data:image\/[^;]+;base64,)[a-zA-Z0-9+/=]{50,}/g, '$1[...]')
      // Any long base64-like strings
      .replace(/[a-zA-Z0-9+/=]{200,}/g, '[...]')
      // Long raw content
      .replace(/"raw": "(.{50}).{100,}"/g, '"raw": "$1..."')
      // Long text content
      .replace(/"text": "(.{50}).{100,}"/g, '"text": "$1..."')
      // Long description content
      .replace(/"description": "(.{50}).{100,}"/g, '"description": "$1..."')
      // Long value content
      .replace(/"value": "(.{50}).{100,}"/g, '"value": "$1..."')
      // Any other long string values
      .replace(/"[^"]+": "(.{100}).{200,}"/g, '"$1": "$1..."');
    
    // Write the processed content back to the file
    fs.writeFileSync(filePath, processed);
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

// Run the script
main();