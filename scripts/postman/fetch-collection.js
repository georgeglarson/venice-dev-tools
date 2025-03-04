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
        
        // Save the collection
        const outputPath = path.join(COLLECTIONS_DIR, 'venice.json');
        fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
        console.log(`Collection saved to: ${outputPath}`);
        
        return collection;
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
  
  // Common patterns for base64 image data
  const patterns = [
    // Standard data URI format for images
    /data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/g,
    // Base64 prefix followed by long base64 string
    /base64,[a-zA-Z0-9+/=]{100,}/g,
    // Long base64 strings (likely to be images or binary data)
    /[a-zA-Z0-9+/=]{500,}/g,
    // Common image formats in base64 (JPEG, PNG, GIF, WebP, SVG)
    /iVBOR[a-zA-Z0-9+/=]{100,}/g,  // PNG
    /R0lGOD[a-zA-Z0-9+/=]{100,}/g, // GIF
    /\/9j\/[a-zA-Z0-9+/=]{100,}/g, // JPEG
    /UklGR[a-zA-Z0-9+/=]{100,}/g,  // WebP
    /PHN2Z[a-zA-Z0-9+/=]{100,}/g   // SVG
  ];
  
  let result = str;
  for (const pattern of patterns) {
    result = result.replace(pattern, (match) => {
      // For data URI format, preserve the prefix
      if (match.includes('base64,')) {
        const prefix = match.substring(0, match.indexOf('base64,') + 7);
        return `${prefix}[Base64 image data truncated - ${match.length - prefix.length} bytes]`;
      }
      // For other patterns, just truncate with a note
      return `[Base64 data truncated - ${match.length} bytes]`;
    });
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
  return size > 2000; // Consider endpoints larger than 2KB as "large" (more aggressive)
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
  
  const endpoints = [];
  const endpointsByCategory = {};
  const endpointsByResource = {};
  
  // Function to recursively process collection items
  function processItems(items, parentName = '') {
    items.forEach(item => {
      const itemName = parentName ? `${parentName}/${item.name}` : item.name;
      
      if (item.request) {
        // This is an endpoint
        const endpoint = {
          name: item.name,
          path: itemName,
          method: item.request.method,
          url: item.request.url.raw,
          description: item.request.description || '',
          headers: item.request.header || [],
          body: item.request.body || null,
          parameters: []
        };
        
        // Extract URL parameters
        if (item.request.url.query) {
          endpoint.parameters = item.request.url.query.map(param => ({
            name: param.key,
            description: param.description || '',
            required: param.disabled ? false : true,
            type: 'query'
          }));
        }
        
        // Extract body parameters for form data
        if (item.request.body && item.request.body.mode === 'formdata' && item.request.body.formdata) {
          item.request.body.formdata.forEach(param => {
            endpoint.parameters.push({
              name: param.key,
              description: param.description || '',
              required: param.disabled ? false : true,
              type: 'formdata',
              valueType: param.type
            });
          });
        }
        
        endpoints.push(endpoint);
        
        // Extract API path components for more granular categorization
        let urlPath = '';
        if (item.request.url.path && Array.isArray(item.request.url.path)) {
          urlPath = item.request.url.path.join('/');
        } else if (typeof item.request.url.raw === 'string') {
          // Extract path from raw URL
          try {
            const url = new URL(item.request.url.raw.replace(/{{[^}]+}}/g, 'placeholder'));
            urlPath = url.pathname.replace(/^\//, '');
          } catch (e) {
            // If URL parsing fails, use a fallback
            const match = item.request.url.raw.match(/\/([^?]+)/);
            if (match) {
              urlPath = match[1];
            }
          }
        }
        
        // Add to category (top-level folder)
        const category = itemName.split('/')[0] || 'Uncategorized';
        if (!endpointsByCategory[category]) {
          endpointsByCategory[category] = [];
        }
        endpointsByCategory[category].push(endpoint);
        
        // Add to resource (based on API path)
        if (urlPath) {
          // Get the first two path components for resource grouping
          const pathParts = urlPath.split('/');
          let resource = pathParts[0] || 'Uncategorized';
          
          // Add second path component if it exists and isn't a parameter
          if (pathParts[1] && !pathParts[1].includes('{')) {
            resource += `/${pathParts[1]}`;
          }
          
          if (!endpointsByResource[resource]) {
            endpointsByResource[resource] = [];
          }
          endpointsByResource[resource].push(endpoint);
        }
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
  
  // Create directories
  const categoriesDir = path.join(ENDPOINTS_DIR, 'by-category');
  const resourcesDir = path.join(ENDPOINTS_DIR, 'by-resource');
  
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }
  
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  }
  
  // Create an index file with minimal information
  const index = {
    totalEndpoints: endpoints.length,
    categories: {},
    resources: {}
  };
  
  // Process categories - chunk large categories
  for (const [category, categoryEndpoints] of Object.entries(endpointsByCategory)) {
    const categoryFileName = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if we need to chunk this category (more than 3 endpoints or any large endpoint)
    const needsChunking = categoryEndpoints.length > 3 ||
                          categoryEndpoints.some(e => isLargeEndpoint(e));
    
    if (needsChunking) {
      // Create a directory for this category
      const categoryDir = path.join(categoriesDir, categoryFileName);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      
      // Create a compact summary file with minimal information
      const summaryPath = path.join(categoryDir, 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(
        categoryEndpoints.map(createCompactEndpoint), null, 2
      ));
      
      // Save endpoints in chunks of 3
      const chunkSize = 3;
      for (let i = 0; i < categoryEndpoints.length; i += chunkSize) {
        // Create a deep copy of the chunk
        const chunk = JSON.parse(JSON.stringify(categoryEndpoints.slice(i, i + chunkSize)));
        
        // Process each endpoint in the chunk to aggressively truncate any base64 image data
        const processedChunk = chunk.map(endpoint => {
          // Deep process the endpoint to truncate all base64 data
          let processedEndpoint = truncateImagesInObject(endpoint);
          
          // Extra check for any remaining large strings that might be base64 data
          if (JSON.stringify(processedEndpoint).length > 10000) {
            // More aggressive truncation for very large endpoints
            processedEndpoint = JSON.parse(JSON.stringify(processedEndpoint, (key, value) => {
              if (typeof value === 'string' && value.length > 500 && containsBase64Data(value)) {
                return `[Large data truncated - ${value.length} bytes]`;
              }
              return value;
            }));
          }
          
          return processedEndpoint;
        });
        
        const chunkPath = path.join(categoryDir, `chunk-${Math.floor(i/chunkSize)}.json`);
        fs.writeFileSync(chunkPath, JSON.stringify(processedChunk, null, 2));
      }
      
      // Add to index
      index.categories[category] = {
        count: categoryEndpoints.length,
        directory: `by-category/${categoryFileName}`,
        summaryFile: `by-category/${categoryFileName}/summary.json`,
        endpoints: categoryEndpoints.map(createMinimalEndpoint)
      };
      
      console.log(`Saved ${categoryEndpoints.length} endpoints to directory: ${categoryDir}`);
    } else {
      // Save small categories to a single file
      const categoryPath = path.join(categoriesDir, `${categoryFileName}.json`);
      fs.writeFileSync(categoryPath, JSON.stringify(categoryEndpoints, null, 2));
      
      // Add to index
      index.categories[category] = {
        count: categoryEndpoints.length,
        file: `by-category/${categoryFileName}.json`,
        endpoints: categoryEndpoints.map(createMinimalEndpoint)
      };
      
      console.log(`Saved ${categoryEndpoints.length} endpoints to: ${categoryPath}`);
    }
  }
  
  // Process resources - always chunk resources with more than 2 endpoints
  for (const [resource, resourceEndpoints] of Object.entries(endpointsByResource)) {
    const resourceFileName = resource.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // More aggressive chunking - chunk if more than 2 endpoints or any large endpoint
    const needsChunking = resourceEndpoints.length > 2 ||
                          resourceEndpoints.some(e => isLargeEndpoint(e));
    
    if (needsChunking) {
      // Create a directory for this resource
      const resourceDir = path.join(resourcesDir, resourceFileName);
      if (!fs.existsSync(resourceDir)) {
        fs.mkdirSync(resourceDir, { recursive: true });
      }
      
      // Create a minimal summary file
      const summaryEndpoints = resourceEndpoints.map(createCompactEndpoint);
      
      const summaryPath = path.join(resourceDir, 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summaryEndpoints, null, 2));
      
      // Save each endpoint to its own file, but strip large fields for very large endpoints
      for (let i = 0; i < resourceEndpoints.length; i++) {
        // Create a copy to avoid modifying the original
        let endpoint = JSON.parse(JSON.stringify(resourceEndpoints[i]));
        
        const endpointFileName = endpoint.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 40); // Shorter filename length
        
        // First pass: truncate all base64 image data
        endpoint = truncateImagesInObject(endpoint);
        
        // For very large endpoints, be more aggressive with truncation
        if (isLargeEndpoint(endpoint)) {
          // Second pass: more aggressive truncation for any remaining large content
          if (endpoint.body) {
            // Keep the body structure but remove large content
            if (endpoint.body.mode === 'raw' && endpoint.body.raw) {
              if (endpoint.body.raw.length > 500) {
                endpoint.body = {
                  ...endpoint.body,
                  raw: `[Content truncated - ${endpoint.body.raw.length} characters]`
                };
              } else if (containsBase64Data(endpoint.body.raw)) {
                endpoint.body = {
                  ...endpoint.body,
                  raw: `[Base64 content truncated - ${endpoint.body.raw.length} characters]`
                };
              }
            } else if (endpoint.body.mode === 'formdata' && endpoint.body.formdata) {
              // Keep formdata structure but truncate file content and any base64 data
              endpoint.body = {
                ...endpoint.body,
                formdata: endpoint.body.formdata.map(item => {
                  if (item.type === 'file' && item.src && typeof item.src === 'string') {
                    return {...item, src: `[File path truncated - ${item.src.length} characters]`};
                  }
                  if (item.value && typeof item.value === 'string' &&
                     (item.value.length > 500 || containsBase64Data(item.value))) {
                    return {...item, value: `[Large value truncated - ${item.value.length} characters]`};
                  }
                  return item;
                })
              };
            }
          }
          
          // Third pass: check for any remaining large strings in the entire object
          endpoint = JSON.parse(JSON.stringify(endpoint, (key, value) => {
            if (typeof value === 'string' &&
               (value.length > 1000 || (value.length > 500 && containsBase64Data(value)))) {
              return `[Large data truncated - ${value.length} bytes]`;
            }
            return value;
          }));
        }
        
        const endpointPath = path.join(resourceDir, `${endpointFileName}-${i}.json`);
        fs.writeFileSync(endpointPath, JSON.stringify(endpoint, null, 2));
      }
      
      // Add to index with minimal information
      index.resources[resource] = {
        count: resourceEndpoints.length,
        directory: `by-resource/${resourceFileName}`,
        summaryFile: `by-resource/${resourceFileName}/summary.json`,
        endpoints: resourceEndpoints.map(createMinimalEndpoint)
      };
      
      console.log(`Saved ${resourceEndpoints.length} endpoints to directory: ${resourceDir}`);
    } else {
      // Save small resources to a single file
      const resourcePath = path.join(resourcesDir, `${resourceFileName}.json`);
      fs.writeFileSync(resourcePath, JSON.stringify(resourceEndpoints, null, 2));
      
      // Add to index
      index.resources[resource] = {
        count: resourceEndpoints.length,
        file: `by-resource/${resourceFileName}.json`,
        endpoints: resourceEndpoints.map(createMinimalEndpoint)
      };
      
      console.log(`Saved ${resourceEndpoints.length} endpoints to: ${resourcePath}`);
    }
  }
  
  // Save index file
  const indexPath = path.join(ENDPOINTS_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Created endpoint index at: ${indexPath}`);
  
  // Save a very compact version of all endpoints (minimal information)
  const compactPath = path.join(ENDPOINTS_DIR, 'endpoints-compact.json');
  fs.writeFileSync(compactPath, JSON.stringify(
    endpoints.map(e => ({
      name: e.name,
      method: e.method,
      path: e.path,
      url: e.url
    })), null, 2
  ));
  console.log(`Saved compact endpoints to: ${compactPath}`);
  
  // Don't save the full endpoints.json or all-endpoints.json files anymore
  console.log(`Skipped creating large endpoints.json file to save space`);
  
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
  
  // Remove all JSON files in the endpoints directory and its subdirectories
  if (fs.existsSync(ENDPOINTS_DIR)) {
    console.log('Removing all files from endpoints directory...');
    
    // First clean top-level JSON files
    const files = fs.readdirSync(ENDPOINTS_DIR);
    for (const file of files) {
      const filePath = path.join(ENDPOINTS_DIR, file);
      if (file.endsWith('.json')) {
        console.log(`Removing old file: ${filePath}`);
        fs.unlinkSync(filePath);
      } else if (fs.statSync(filePath).isDirectory() && file !== 'collections') {
        // Recursively clean all subdirectories except collections
        console.log(`Cleaning subdirectory: ${file}`);
        cleanDirectory(filePath);
      }
    }
    
    // Explicitly clean the main subdirectories to be sure
    const categoriesDir = path.join(ENDPOINTS_DIR, 'by-category');
    const resourcesDir = path.join(ENDPOINTS_DIR, 'by-resource');
    
    if (fs.existsSync(categoriesDir)) {
      console.log('Deep cleaning by-category directory...');
      cleanDirectory(categoriesDir);
    }
    
    if (fs.existsSync(resourcesDir)) {
      console.log('Deep cleaning by-resource directory...');
      cleanDirectory(resourcesDir);
    }
  }
  
  // Ensure directories exist
  const categoriesDir = path.join(ENDPOINTS_DIR, 'by-category');
  const resourcesDir = path.join(ENDPOINTS_DIR, 'by-resource');
  
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }
  
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
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
    const collection = await fetchCollection();
    
    // Extract endpoints if requested
    if (extractEndpointsFlag) {
      // Clean up old files first
      cleanEndpointsDirectory();
      
      // Extract endpoints
      extractEndpoints(collection);
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

// Run the script
main();