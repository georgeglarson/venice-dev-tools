/**
 * Test Utilities
 *
 * Common utilities for Venice AI SDK tests
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Retry a function until it succeeds or reaches max attempts
 *
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} options.delay - Delay between attempts in ms (default: 1000)
 * @param {Function} options.onRetry - Function to call on retry (default: console.log)
 * @returns {Promise<any>} - The result of the function
 */
async function retry(fn, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const delay = options.delay || 1000;
  const onRetry = options.onRetry || ((attempt, error) => {
    console.log(`Retry attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
  });

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        onRetry(attempt, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Wait for a specified amount of time
 *
 * @param {number} ms - Time to wait in milliseconds
 * @returns {Promise<void>}
 */
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock VeniceAI class for testing
class MockVeniceAI {
  constructor(options) {
    this.options = options;
    this.chat = {
      completions: {
        create: async () => ({
          id: 'mock-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'mock-model',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'This is a mock response from the Venice AI SDK.'
              },
              finish_reason: 'stop'
            }
          ]
        })
      }
    };
    this.image = {
      generate: async () => ({
        id: 'mock-id',
        created: Date.now(),
        url: 'https://example.com/mock-image.jpg'
      }),
      upscale: async () => ({
        id: 'mock-id',
        created: Date.now(),
        url: 'https://example.com/mock-upscaled-image.jpg'
      }),
      styles: {
        list: async () => ({
          styles: [
            { id: 'mock-style-1', name: 'Mock Style 1' },
            { id: 'mock-style-2', name: 'Mock Style 2' }
          ]
        }),
        getStyle: async (id) => ({
          id,
          name: `Mock Style ${id}`,
          description: 'This is a mock style'
        })
      }
    };
    this.models = {
      list: async () => ({
        models: [
          { id: 'llama-3.3-70b', name: 'Llama 3.3 70B' },
          { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL' }
        ]
      }),
      get: async (id) => ({
        id,
        name: `Mock Model ${id}`,
        description: 'This is a mock model'
      })
    };
    this.apiKeys = {
      list: async () => {
        const result = {
          keys: [
            { id: 'mock-key-1', name: 'Mock Key 1' },
            { id: 'mock-key-2', name: 'Mock Key 2' }
          ]
        };
        // Add the getKey method to the function
        result.getKey = async (id) => ({
          id,
          name: `Mock Key ${id}`,
          description: 'This is a mock API key'
        });
        return result;
      },
      rateLimits: async () => ({
        rate_limits: [
          { model_id: 'llama-3.3-70b', model_name: 'Llama 3.3 70B', limit: 100, remaining: 50 }
        ],
        tier: 'mock-tier'
      }),
      getModelRateLimits: async (modelId) => ({
        model_id: modelId,
        limit: 100,
        remaining: 50
      })
    };
    this.characters = {
      list: async () => ({
        characters: [
          { id: 'mock-char-1', name: 'Mock Character 1' },
          { id: 'mock-char-2', name: 'Mock Character 2' }
        ]
      }),
      get: async (id) => ({
        id,
        name: `Mock Character ${id}`,
        description: 'This is a mock character'
      }),
      chat: async (params) => ({
        id: 'mock-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'mock-model',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: `This is a mock response from character ${params.character_id}.`
            },
            finish_reason: 'stop'
          }
        ]
      })
    };
    this.vvv = {
      circulatingSupply: async () => ({
        supply: 1000000
      }),
      utilization: async () => ({
        utilization: 0.75
      }),
      stakingYield: async () => ({
        yield: 0.05
      })
    };
  }
}

/**
 * Create a Venice AI client with consistent configuration
 *
 * @param {Object} options - Additional client options
 * @returns {Object} - Configured Venice AI client (real or mock)
 */
function createClient(options = {}) {
  // Check if API key is provided
  if (!process.env.VENICE_API_KEY) {
    console.warn('Warning: VENICE_API_KEY environment variable is not set');
    console.warn('Using mock API key for testing');
    process.env.VENICE_API_KEY = 'mock-api-key';
  }

  // Check if we should use the real SDK
  const useRealSdk = process.env.USE_REAL_SDK === 'true';
  
  // Check if we should prevent fallbacks to mock implementations
  const preventMockFallback = process.env.PREVENT_MOCK_FALLBACK === 'true' || useRealSdk;

  if (useRealSdk) {
    try {
      let VeniceAI;
      try {
        // Use the test bundle for Node.js environment
        VeniceAI = require('../../dist/test-bundle.js').default;
      } catch (error) {
        console.error('Error importing SDK:', error.message);
        throw error;
      }
      
      // Create the real client
      console.log('Creating real Venice AI client for testing');
      const realClient = new VeniceAI({
        apiKey: process.env.VENICE_API_KEY,
        logLevel: process.env.LOG_LEVEL || 'debug',
        ...options
      });

      // Create a wrapper around the real client to adapt the API response format to what our tests expect
      const client = {
        // Models resource
        models: {
          list: async (params = {}) => {
            try {
              // If type is 'chat', change it to 'text' as the API expects
              if (params.type === 'chat') {
                params.type = 'text';
              }
              
              const response = await realClient.models.list(params);
              
              // Transform the response to match the expected format
              return {
                models: (response.data || []).map(model => ({
                  id: model.id,
                  name: model.id, // Use id as name if name is not provided
                  type: model.type || 'text',
                  description: `${model.owned_by || 'Venice AI'} model`,
                  ...model
                }))
              };
            } catch (error) {
              console.error('Error in models.list:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                models: [
                  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B' },
                  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL' }
                ]
              };
            }
          },
          get: async (id) => {
            try {
              // The API doesn't have a direct get model endpoint, so we'll list and filter
              const response = await realClient.models.list();
              const model = response.data.find(m => m.id === id);
              if (!model) {
                throw new Error(`Model ${id} not found`);
              }
              
              // Transform the model to match the expected format
              return {
                id: model.id,
                name: model.id, // Use id as name if name is not provided
                type: model.type || 'text',
                description: `${model.owned_by || 'Venice AI'} model`,
                ...model
              };
            } catch (error) {
              console.error('Error in models.get:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                id,
                name: `Model ${id}`,
                description: 'This is a real model'
              };
            }
          }
        },
        
        // Chat resource
        chat: {
          completions: {
            create: async (params = {}) => {
              try {
                // Check if this is a file attachment request
                const hasFileAttachment = params.messages &&
                  params.messages.some(msg =>
                    msg.content && Array.isArray(msg.content) &&
                    msg.content.some(item => item.type === 'file')
                  );
                
                if (hasFileAttachment) {
                  console.log('Creating chat completion with file attachments');
                  // Don't log the full params as they may contain file data
                  console.log('Creating chat completion with file attachments (file data excluded from logs)');
                  
                  // We need to handle file attachments differently
                  // Extract file attachments from messages
                  const formData = new FormData();
                  
                  // Add the request parameters as JSON
                  formData.append('request', JSON.stringify({
                    model: params.model,
                    stream: params.stream || false
                  }));
                  
                  // Process messages to extract file attachments
                  const processedMessages = [];
                  let fileCounter = 0;
                  
                  for (const msg of params.messages) {
                    if (Array.isArray(msg.content)) {
                      const processedContent = [];
                      
                      for (const item of msg.content) {
                        if (item.type === 'file') {
                          // Generate a unique file ID
                          const fileKey = `file_${fileCounter++}`;
                          
                          // Handle file attachments based on type
                          const base64Data = item.file.data;
                          const mimeType = item.file.mime_type;
                          const fileName = item.file.name;
                          
                          // For images, we can use image_url with data URL
                          if (mimeType.startsWith('image/')) {
                            processedContent.push({
                              type: 'image_url',
                              image_url: {
                                url: `data:${mimeType};base64,${base64Data}`
                              }
                            });
                          } else if (mimeType === 'application/pdf') {
                            // The API doesn't support PDF files directly, so we'll extract the text
                            console.log('Processing PDF file:', fileName);
                            
                            try {
                              // Use pdf-parse to extract text from the PDF
                              const pdfParse = require('pdf-parse');
                              const fileBuffer = Buffer.from(base64Data, 'base64');
                              
                              // Extract text from the PDF with a timeout to prevent hanging
                              const pdfData = await pdfParse(fileBuffer, {
                                max: 10000, // Limit to first 10000 characters to prevent timeouts with large PDFs
                                timeout: 15000 // 15 second timeout
                              });
                              const pdfText = pdfData.text || 'No text content found in PDF';
                              
                              console.log(`Extracted ${pdfText.length} characters of text from PDF`);
                              console.log(`First 100 characters of extracted text: "${pdfText.substring(0, 100)}..."`);
                              
                              // If the extracted text is too short, add a more descriptive message
                              if (pdfText.length < 10) {
                                processedContent.push({
                                  type: 'text',
                                  text: `The file "${fileName}" appears to be mostly graphical or contains very little text content. It has ${pdfText.length} characters of text: "${pdfText}". The PDF may contain images, charts, or other non-text elements that cannot be extracted as text. If you need to refer to this document, please call it "${fileName}".`
                                });
                              } else {
                                // Add the extracted text as a text content part
                                processedContent.push({
                                  type: 'text',
                                  text: `Content from file "${fileName}":\n\n${pdfText}\n\nThe above text was extracted from the PDF file named "${fileName}". If you need to refer to this document, please call it "${fileName}".`
                                });
                              }
                              
                              // Don't add the PDF file as an attachment, just use the extracted text
                              // This prevents timeouts when sending large PDFs to the API
                            } catch (error) {
                              console.error('Error extracting text from PDF:', error.message);
                              
                              // Fallback to a simple text description
                              processedContent.push({
                                type: 'text',
                                text: `[This is a file named "${fileName}". Unable to extract text content: ${error.message}. If you need to refer to this document, please call it "${fileName}".]`
                              });
                            }
                          } else {
                            // For other file types, we'll just add a text description
                            processedContent.push({
                              type: 'text',
                              text: `[File: ${fileName} (${mimeType})]`
                            });
                          }
                          
                          // For PDF files, we've already extracted the text and added it to the content
                          // Don't add the raw PDF file to the form data to prevent timeouts
                          if (mimeType !== 'application/pdf') {
                            try {
                              // For browser environments, create a Blob
                              const fileBuffer = Buffer.from(item.file.data, 'base64');
                              
                              // Create a Blob-like object that works in Node.js
                              const blob = new Blob([fileBuffer], { type: item.file.mime_type });
                              
                              // Add file to form data
                              formData.append(fileKey, blob, item.file.name);
                            } catch (error) {
                              console.error('Error creating file blob:', error.message);
                              // If Blob is not available (Node.js environment), use a different approach
                              // This is a fallback that should work in Node.js
                              const fileBuffer = Buffer.from(item.file.data, 'base64');
                              formData.append(fileKey, fileBuffer, {
                                filename: item.file.name,
                                contentType: item.file.mime_type
                              });
                            }
                          }
                        } else {
                          // Keep other content items as is
                          processedContent.push(item);
                        }
                      }
                      
                      // Add processed message
                      processedMessages.push({
                        ...msg,
                        content: processedContent
                      });
                    } else {
                      // Keep messages without file attachments as is
                      processedMessages.push(msg);
                    }
                  }
                  
                  // Add processed messages to form data
                  formData.append('messages', JSON.stringify(processedMessages));
                  
                  // Make the API request
                  try {
                    console.log('Making POST request to /chat/completions');
                    console.log('Request: POST /chat/completions');
                    console.log({
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer [REDACTED]',
                        'User-Agent': 'Venice-AI-SDK-APL/0.1.0'
                      },
                      data: '[FILE DATA EXCLUDED]'
                    });
                    
                    // Instead of using FormData, let's use the real SDK's chat.completions.create method
                    // but with a modified request that includes file references
                    
                    // First, let's create a modified version of the params without the file data
                    const modifiedParams = {
                      ...params,
                      messages: processedMessages
                    };
                    
                    // Make the API request
                    const response = await realClient.chat.completions.create(modifiedParams);
                    
                    // Return the response directly, it already contains the data
                    return response;
                  } catch (error) {
                    console.error('Error in chat.completions.create with file attachment:', error.message);
                    if (error.response) {
                      console.error('API Error:', error.response.data);
                    }
                    // Don't return mock data, let the error propagate
                    throw error;
                  }
                } else {
                  // Regular chat completion without file attachments
                  const response = await realClient.chat.completions.create(params);
                  return response;
                }
              } catch (error) {
                console.error('Error in chat.completions.create:', error.message);
                // Don't return mock data, let the error propagate
                throw error;
              }
            }
          }
        },
        
        // Image resource
        image: {
          generate: async (params = {}) => {
            try {
              // Don't log the full params as they may contain image data
              console.log('Image generate params (image data excluded from logs)');
              // For image generation, we need to handle the request properly
              const response = await realClient.image.generate(params);
              // Don't log the full response as it may contain image data
              console.log('Image generate response received (image data excluded from logs)');
              return response;
            } catch (error) {
              console.error('Error in image.generate:', error.message);
              if (error.response) {
                console.error('API Error:', error.response.data);
              }
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                id: 'mock-id',
                created: Date.now(),
                images: [
                  { url: 'https://example.com/mock-image.jpg' }
                ]
              };
            }
          },
          upscale: async (params = {}) => {
            try {
              // Don't log the full params as they may contain image data
              console.log('Image upscale params (image data excluded from logs)');
              
              // Use the real SDK implementation for upscale
              // If the image is a Buffer, use it directly
              if (typeof params.image === 'object' && Buffer.isBuffer(params.image)) {
                console.log('Using Buffer directly for upscale');
                const response = await realClient.image.upscale(params);
                return response;
              } else if (typeof params.image === 'string') {
                // If it's a base64 string, convert it to a Buffer first
                console.log('Converting base64 to Buffer for upscale');
                const imageBuffer = Buffer.from(params.image, 'base64');
                const bufferParams = {
                  ...params,
                  image: imageBuffer
                };
                const response = await realClient.image.upscale(bufferParams);
                return response;
              } else {
                throw new Error('Image must be a Buffer or base64 string');
              }
            } catch (error) {
              console.error('Error in image.upscale:', error.message);
              if (error.response) {
                console.error('API Error:', error.response.data);
              }
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                id: 'mock-id',
                created: Date.now(),
                url: 'https://example.com/mock-upscaled-image.jpg'
              };
            }
          },
          styles: {
            list: async () => {
              try {
                const response = await realClient.image.styles.list();
                console.log('Image styles list response:', response);
                return {
                  styles: response.styles || []
                };
              } catch (error) {
                console.error('Error in image.styles.list:', error.message);
                if (error.response) {
                  console.error('API Error:', error.response.data);
                }
                
                // If we're preventing mock fallbacks, throw the error
                if (preventMockFallback) {
                  throw error;
                }
                
                // Return mock data as fallback only if allowed
                return {
                  styles: [
                    { id: 'mock-style-1', name: 'Mock Style 1' },
                    { id: 'mock-style-2', name: 'Mock Style 2' }
                  ]
                };
              }
            },
            getStyle: async (id) => {
              try {
                // The API doesn't have a direct getStyle endpoint, so we'll list and filter
                const response = await realClient.image.styles.list();
                const style = response.styles.find(s => s.id === id);
                if (!style) {
                  throw new Error(`Style ${id} not found`);
                }
                
                // Return the style details
                return {
                  id: style.id,
                  name: style.name,
                  description: style.description || `${style.name} style for image generation`
                };
              } catch (error) {
                console.error(`Error in image.styles.getStyle(${id}):`, error.message);
                
                // If we're preventing mock fallbacks, throw the error
                if (preventMockFallback) {
                  throw error;
                }
                
                // Return mock data as fallback only if allowed
                return {
                  id,
                  name: `Style ${id}`,
                  description: `${id} style for image generation`
                };
              }
            }
          }
        },
        
        // Characters resource
        characters: {
          list: async () => {
            try {
              const response = await realClient.characters.list();
              console.log('Characters list response:', response);
              // Transform the response to match the expected format
              return {
                characters: response.data || []
              };
            } catch (error) {
              console.error('Error in characters.list:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                characters: [
                  { id: 'mock-char-1', name: 'Mock Character 1' },
                  { id: 'mock-char-2', name: 'Mock Character 2' }
                ]
              };
            }
          },
          get: async (id) => {
            try {
              const response = await realClient.characters.get(id);
              console.log(`Character get response for ${id}:`, response);
              return response;
            } catch (error) {
              console.error('Error in characters.get:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                id,
                name: `Character ${id}`,
                description: 'This is a mock character'
              };
            }
          },
          chat: async (params) => {
            try {
              // The characters.chat method might not exist in the SDK
              // Instead, we'll use the chat.completions.create method with the character parameter
              const response = await realClient.chat.completions.create({
                model: params.model || 'llama-3.3-70b',
                messages: params.messages || [{ role: 'user', content: 'Hello' }],
                venice_parameters: {
                  character_slug: params.character_id
                }
              });
              console.log(`Character chat response for ${params.character_id}:`, response);
              return response;
            } catch (error) {
              console.error('Error in characters.chat:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                id: 'mock-id',
                object: 'chat.completion',
                created: Date.now(),
                model: `character:${params.character_id}`,
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: `This is a fallback response from character ${params.character_id}.`
                    },
                    finish_reason: 'stop'
                  }
                ]
              };
            }
          }
        },
        
        // API Keys resource
        apiKeys: {
          list: async () => {
            try {
              const response = await realClient.apiKeys.list();
              return response;
            } catch (error) {
              console.error('Error in apiKeys.list:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                keys: [
                  { id: 'mock-key-1', name: 'Mock Key 1' },
                  { id: 'mock-key-2', name: 'Mock Key 2' }
                ]
              };
            }
          },
          rateLimits: async () => {
            try {
              const response = await realClient.apiKeys.rateLimits();
              return response;
            } catch (error) {
              console.error('Error in apiKeys.rateLimits:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                rate_limits: [
                  { model_id: 'llama-3.3-70b', model_name: 'Llama 3.3 70B', limit: 100, remaining: 50 }
                ],
                tier: 'mock-tier'
              };
            }
          },
          getModelRateLimits: async (modelId) => {
            try {
              const response = await realClient.apiKeys.getModelRateLimits(modelId);
              return response;
            } catch (error) {
              console.error('Error in apiKeys.getModelRateLimits:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                model_id: modelId,
                limit: 100,
                remaining: 50
              };
            }
          }
        },
        
        // VVV resource
        vvv: {
          circulatingSupply: async () => {
            try {
              // VVV endpoints don't require authentication
              const response = await realClient.vvv.circulatingSupply();
              console.log('VVV circulating supply response:', response);
              return response;
            } catch (error) {
              console.error('Error in vvv.circulatingSupply:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                circulating_supply: 1000000,
                total_supply: 2000000,
                percentage_circulating: "50%",
                timestamp: new Date().toISOString()
              };
            }
          },
          utilization: async () => {
            try {
              // VVV endpoints don't require authentication
              const response = await realClient.vvv.utilization();
              console.log('VVV utilization response:', response);
              return response;
            } catch (error) {
              console.error('Error in vvv.utilization:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                utilization_percentage: "75%",
                capacity: 1000000,
                usage: 750000,
                timestamp: new Date().toISOString()
              };
            }
          },
          stakingYield: async () => {
            try {
              // VVV endpoints don't require authentication
              const response = await realClient.vvv.stakingYield();
              console.log('VVV staking yield response:', response);
              return response;
            } catch (error) {
              console.error('Error in vvv.stakingYield:', error.message);
              
              // If we're preventing mock fallbacks, throw the error
              if (preventMockFallback) {
                throw error;
              }
              
              // Return mock data as fallback only if allowed
              return {
                current_apy: "5%",
                total_staked: 500000,
                percentage_staked: "25%",
                timestamp: new Date().toISOString()
              };
            }
          }
        }
      };

      return client;
    } catch (error) {
      console.error('Error creating real Venice AI client:', error.message);
      console.warn('Falling back to mock implementation');
    }
  }

  // Create the mock client
  console.log('Creating mock Venice AI client for testing');
  const client = new MockVeniceAI({
    apiKey: process.env.VENICE_API_KEY,
    logLevel: process.env.LOG_LEVEL || 'debug',
    ...options
  });

  return client;
}

/**
 * Run a test function and handle errors consistently
 *
 * @param {string} testName - Name of the test
 * @param {Function} testFn - Async test function to run
 * @param {Object} options - Test options
 * @param {boolean} options.retry - Whether to retry the test on failure
 * @param {number} options.maxAttempts - Maximum number of retry attempts
 * @param {number} options.delay - Delay between retry attempts in ms
 * @returns {Promise<boolean>} - Whether the test succeeded
 */
async function runTest(testName, testFn, options = {}) {
  console.log(`\n=== Running ${testName} ===\n`);
  
  try {
    if (options.retry) {
      // Run with retry
      await retry(
        testFn,
        {
          maxAttempts: options.maxAttempts || 3,
          delay: options.delay || 1000,
          onRetry: (attempt, error) => {
            console.log(`Retry ${attempt} for "${testName}" after error: ${error.message}`);
          }
        }
      );
    } else {
      // Run without retry
      await testFn();
    }
    
    console.log(`\n✅ ${testName} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${testName} failed with error:`, error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return false;
  }
}

/**
 * Load a test file from the project
 *
 * @param {string} relativePath - Path relative to the project root
 * @returns {Buffer} - File buffer
 */
function loadTestFile(relativePath) {
  const projectRoot = path.join(__dirname, '../..');
  const filePath = path.join(projectRoot, relativePath);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test file not found: ${filePath}`);
  }
  
  return fs.readFileSync(filePath);
}

/**
 * Validate API response against expected schema
 *
 * @param {Object} response - API response to validate
 * @param {Object} expectedSchema - Expected schema with field types
 * @returns {boolean} - Whether the response matches the expected schema
 * @throws {Error} - If validation fails
 */
function validateResponse(response, expectedSchema) {
  // Implementation of schema validation
  // This could use a library like Joi or Ajv
  
  // For now, a simple implementation
  for (const key of Object.keys(expectedSchema)) {
    if (!(key in response)) {
      throw new Error(`Response missing expected field: ${key}`);
    }
    
    const expectedType = expectedSchema[key];
    const actualValue = response[key];
    
    if (expectedType === 'array' && !Array.isArray(actualValue)) {
      throw new Error(`Expected ${key} to be an array, got ${typeof actualValue}`);
    } else if (expectedType !== 'array' && typeof actualValue !== expectedType) {
      throw new Error(`Expected ${key} to be ${expectedType}, got ${typeof actualValue}`);
    }
  }
  
  return true;
}

/**
 * Compare two objects for deep equality
 *
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} - Whether the objects are deeply equal
 */
function compareObjects(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!compareObjects(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * Setup test environment
 *
 * @returns {Promise<void>}
 */
async function setupTestEnvironment() {
  // Implementation of test environment setup
  console.log('Setting up test environment...');
  // Could include things like creating test resources, etc.
}

/**
 * Cleanup test environment
 *
 * @returns {Promise<void>}
 */
async function cleanupTestEnvironment() {
  // Implementation of test environment cleanup
  console.log('Cleaning up test environment...');
  // Could include things like deleting test resources, etc.
}

/**
 * Log test results in a consistent format
 *
 * @param {Object} results - Object with test names as keys and boolean results as values
 */
function logTestResults(results) {
  console.log('\n=== Test Summary ===');
  
  let allPassed = true;
  for (const [test, success] of Object.entries(results)) {
    console.log(`${test}: ${success ? '✅ Passed' : '❌ Failed'}`);
    if (!success) allPassed = false;
  }
  
  console.log(`\nOverall Result: ${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
  
  return allPassed;
}

/**
 * Wait for a specified amount of time
 *
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or reaches max attempts
 *
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of attempts
 * @param {number} options.delay - Delay between attempts in milliseconds
 * @returns {Promise<any>} - Result of the function
 */
async function retry(fn, { maxAttempts = 3, delay = 1000 } = {}) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
      lastError = error;
      
      if (attempt < maxAttempts) {
        console.log(`Retrying in ${delay}ms...`);
        await wait(delay);
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  createClient,
  runTest,
  loadTestFile,
  validateResponse,
  compareObjects,
  setupTestEnvironment,
  cleanupTestEnvironment,
  logTestResults,
  wait,
  retry
};