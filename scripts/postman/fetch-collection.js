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
const POSTMAN_AUTH_KEY = process.env[POSTMAN_ENV_VAR] || '';
const VENICE_WORKSPACE_ID = 'veniceai'; // This is the workspace ID from the URL

// Check if API key is provided
if (!POSTMAN_AUTH_KEY) {
  console.warn(`Warning: No Postman API key provided. Set the ${POSTMAN_ENV_VAR} environment variable in your .env file.`);
  console.warn('Using placeholder collection instead.');
}

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
 * Fetches the Venice AI Postman collection
 */
async function fetchCollection() {
  try {
    console.log('Fetching Venice AI Postman collections...');
    
    // Use the Postman API to get all collections
    const headers = {
      'X-Api-Key': POSTMAN_AUTH_KEY
    };
    
    try {
      // First try to get all collections
      const collectionsResponse = await axios.get(`${POSTMAN_API_URL}/collections`, { headers });
      
      if (collectionsResponse.data && collectionsResponse.data.collections) {
        const collections = collectionsResponse.data.collections;
        console.log(`Found ${collections.length} collections`);
        
        // Look for Venice AI collections
        const veniceCollections = collections.filter(collection =>
          collection.name.toLowerCase().includes('venice') ||
          collection.name.toLowerCase().includes('ai')
        );
        
        if (veniceCollections.length > 0) {
          console.log(`Found ${veniceCollections.length} Venice-related collections`);
          
          // Get the first Venice collection details
          const collectionId = veniceCollections[0].uid;
          const collectionResponse = await axios.get(`${POSTMAN_API_URL}/collections/${collectionId}`, { headers });
          
          if (collectionResponse.data && collectionResponse.data.collection) {
            const collection = collectionResponse.data.collection;
            console.log(`Successfully fetched collection: ${collection.info.name}`);
            
            // Save the collection
            const outputPath = path.join(COLLECTIONS_DIR, `${collection.info.name.replace(/\s+/g, '-').toLowerCase()}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
            console.log(`Collection saved to: ${outputPath}`);
            
            return collection;
          }
        }
      }
      
      // If we get here, we couldn't find a Venice collection
      console.log('Could not find a Venice AI collection. Using placeholder instead.');
    } catch (apiError) {
      console.error('Error accessing Postman API:', apiError.message);
      if (apiError.response) {
        console.error('Status:', apiError.response.status);
        console.error('Response:', JSON.stringify(apiError.response.data, null, 2));
      }
      console.log('Using placeholder collection instead.');
    }
    
    // Create a placeholder collection file as fallback
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
    const outputPath = path.join(COLLECTIONS_DIR, 'venice-ai-api-placeholder.json');
    fs.writeFileSync(outputPath, JSON.stringify(placeholderCollection, null, 2));
    console.log(`Placeholder collection saved to: ${outputPath}`);
    
    // Return the placeholder collection
    return placeholderCollection;
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
function extractEndpoints(collection) {
  console.log('Extracting endpoints from collection...');
  
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
  
  // Process all items in the collection
  if (collection.item && collection.item.length > 0) {
    processItems(collection.item);
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
  
  // Create an index file
  const index = {
    totalEndpoints: endpoints.length,
    categories: {},
    resources: {}
  };
  
  // Save each category to a separate file
  for (const [category, categoryEndpoints] of Object.entries(endpointsByCategory)) {
    const categoryFileName = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const categoryPath = path.join(categoriesDir, `${categoryFileName}.json`);
    fs.writeFileSync(categoryPath, JSON.stringify(categoryEndpoints, null, 2));
    
    // Add to index
    index.categories[category] = {
      count: categoryEndpoints.length,
      file: `by-category/${categoryFileName}.json`,
      endpoints: categoryEndpoints.map(e => ({
        name: e.name,
        method: e.method,
        path: e.path
      }))
    };
    
    console.log(`Saved ${categoryEndpoints.length} endpoints to: ${categoryPath}`);
  }
  
  // Save each resource to a separate file, with chunking for large resources
  for (const [resource, resourceEndpoints] of Object.entries(endpointsByResource)) {
    const resourceFileName = resource.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if we need to chunk this resource (more than 5 endpoints or any endpoint with large body)
    const needsChunking = resourceEndpoints.length > 5 ||
                          resourceEndpoints.some(e =>
                            e.body && JSON.stringify(e.body).length > 10000);
    
    if (needsChunking) {
      // Create a directory for this resource
      const resourceDir = path.join(resourcesDir, resourceFileName);
      if (!fs.existsSync(resourceDir)) {
        fs.mkdirSync(resourceDir, { recursive: true });
      }
      
      // Create a compact summary file
      const summaryEndpoints = resourceEndpoints.map(e => ({
        name: e.name,
        method: e.method,
        path: e.path,
        url: e.url,
        description: e.description,
        parameters: e.parameters.map(p => ({
          name: p.name,
          description: p.description,
          required: p.required,
          type: p.type
        }))
      }));
      
      const summaryPath = path.join(resourceDir, 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summaryEndpoints, null, 2));
      
      // Save each endpoint to its own file
      for (let i = 0; i < resourceEndpoints.length; i++) {
        const endpoint = resourceEndpoints[i];
        const endpointFileName = endpoint.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 50); // Limit filename length
        
        const endpointPath = path.join(resourceDir, `${endpointFileName}-${i}.json`);
        fs.writeFileSync(endpointPath, JSON.stringify(endpoint, null, 2));
      }
      
      // Add to index
      index.resources[resource] = {
        count: resourceEndpoints.length,
        directory: `by-resource/${resourceFileName}`,
        summaryFile: `by-resource/${resourceFileName}/summary.json`,
        endpoints: resourceEndpoints.map(e => ({
          name: e.name,
          method: e.method,
          path: e.path
        }))
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
        endpoints: resourceEndpoints.map(e => ({
          name: e.name,
          method: e.method,
          path: e.path
        }))
      };
      
      console.log(`Saved ${resourceEndpoints.length} endpoints to: ${resourcePath}`);
    }
  }
  
  // Save index file
  const indexPath = path.join(ENDPOINTS_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Created endpoint index at: ${indexPath}`);
  
  // Save a smaller version of all endpoints (without headers and body)
  const compactEndpoints = endpoints.map(e => ({
    name: e.name,
    path: e.path,
    method: e.method,
    url: e.url,
    description: e.description,
    parameters: e.parameters
  }));
  
  const compactPath = path.join(ENDPOINTS_DIR, 'endpoints-compact.json');
  fs.writeFileSync(compactPath, JSON.stringify(compactEndpoints, null, 2));
  console.log(`Saved compact endpoints to: ${compactPath}`);
  
  return endpoints;
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const extractEndpointsFlag = process.argv.includes('--extract');
    
    // Fetch the collection
    const collection = await fetchCollection();
    
    // Extract endpoints if requested
    if (extractEndpointsFlag) {
      extractEndpoints(collection);
    }
    
    console.log('\nNext steps:');
    console.log('1. You can run this script periodically to fetch the latest Venice AI Postman collection');
    console.log('2. Use the --extract flag to update the endpoint information');
    console.log(`3. To use the Postman API, add your API key to the .env file: ${POSTMAN_ENV_VAR}=your_key_here`);
    console.log('\nAlternatively, you can manually export the collection:');
    console.log('1. Visit: https://www.postman.com/veniceai/venice-ai-workspace/');
    console.log('2. Export the collection from the Postman UI');
    console.log('3. Save it to the postman/collections directory');
    console.log('4. Run this script with --extract to extract endpoint information');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();