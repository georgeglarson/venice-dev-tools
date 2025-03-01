---
layout: default
title: Venice AI SDK - Complete Endpoint Coverage Plan
---

# Venice AI SDK - Complete Endpoint Coverage Implementation Plan

This document outlines a comprehensive implementation plan to ensure the Venice AI SDK covers ALL endpoints from the Postman collection. This plan will ensure complete API coverage through the CLI interface.

## Complete Endpoint Coverage Matrix

### 1. Chat Completions Endpoints

| Endpoint | Current CLI Coverage | Implementation Status | Priority |
|----------|---------------------|----------------------|----------|
| Basic chat completion | `venice chat` | ✅ Implemented | - |
| Streaming chat | `venice chat` (no explicit streaming flag) | ⚠️ Partial | High |
| Web Search: Force Off | `venice chat` (default behavior) | ✅ Implemented | - |
| Web Search: Force On | `venice chat --web-search` | ✅ Implemented | - |
| Web Search: Force On - Complex Message | No explicit support | ❌ Missing | Medium |
| Web Search: Auto | No explicit support | ❌ Missing | Medium |
| Web Search: Auto via Model Feature Suffix | No explicit support | ❌ Missing | Medium |
| Character Interaction | `venice chat --model character:slug` | ✅ Implemented | - |
| Remove Venice System Prompt | No explicit support | ❌ Missing | Medium |
| Vision: Base64 Encoded | No explicit support | ❌ Missing | High |
| Vision: Embedded URL | No explicit support | ❌ Missing | High |
| Function Calling: sovereign-freysa | No explicit support | ❌ Missing | High |
| Function Calling: Coinbase Agentkit | No explicit support | ❌ Missing | High |
| Function Calling: Query LLM or Generate Images | No explicit support | ❌ Missing | High |
| Model Examples: Deepseek Coder V2 Beta | No explicit support | ❌ Missing | Low |
| Model Examples: Mistral Codestral 22B | No explicit support | ❌ Missing | Low |
| Model Examples: Deepseek 671b | No explicit support | ❌ Missing | Low |
| Model Examples: Llama 405B | No explicit support | ❌ Missing | Low |
| Model Examples: Llama 3.3 72B | No explicit support | ❌ Missing | Low |
| Model Examples: gpt-4o-mini Compatibility | No explicit support | ❌ Missing | Low |
| Model Examples: Qwen Coder | No explicit support | ❌ Missing | Low |

### 2. Models Endpoints

| Endpoint | Current CLI Coverage | Implementation Status | Priority |
|----------|---------------------|----------------------|----------|
| List All Models | `venice list-models` | ✅ Implemented | - |
| List Text Models | `venice list-models` (no type filter) | ⚠️ Partial | Medium |
| List Code Models | `venice list-models` (no type filter) | ⚠️ Partial | Medium |
| List Image Models | `venice list-models` (no type filter) | ⚠️ Partial | Medium |
| List Text Model Traits | No explicit support | ❌ Missing | High |
| List Image Model Traits | No explicit support | ❌ Missing | High |
| Text Compatibility Mappings | No explicit support | ❌ Missing | High |

### 3. Image Endpoints

| Endpoint | Current CLI Coverage | Implementation Status | Priority |
|----------|---------------------|----------------------|----------|
| Generate Image (Fluently) | `venice generate-image` | ✅ Implemented | - |
| Generate Image (Stable Diffusion 3.5) | `venice generate-image` (no model selection) | ⚠️ Partial | Medium |
| Generate Image (Flux) | `venice generate-image` (no model selection) | ⚠️ Partial | Medium |
| Generate Image (Flux Uncensored) | `venice generate-image` (no model selection) | ⚠️ Partial | Medium |
| Generate Image (Lustify) | `venice generate-image` (no model selection) | ⚠️ Partial | Medium |
| Generate Image (Pony) | `venice generate-image` (no model selection) | ⚠️ Partial | Medium |
| Inpainting Using Defined Mask | No explicit support | ❌ Missing | High |
| Inpainting Using Prompt | No explicit support | ❌ Missing | High |
| Binary Response | No explicit support | ❌ Missing | Low |
| JSON Response | `venice generate-image --raw` | ✅ Implemented | - |
| Safe Mode Example | No explicit support | ❌ Missing | Medium |
| Upscale an image | No explicit support | ❌ Missing | High |
| Get Image Styles | `venice list-styles` | ✅ Implemented | - |

### 4. Characters Endpoints

| Endpoint | Current CLI Coverage | Implementation Status | Priority |
|----------|---------------------|----------------------|----------|
| List Characters | `venice list-characters` | ✅ Implemented | - |
| Filter Characters (isWebEnabled) | No explicit support | ❌ Missing | Medium |
| Filter Characters (isAdult) | No explicit support | ❌ Missing | Medium |

### 5. VVV Token Endpoints

| Endpoint | Current CLI Coverage | Implementation Status | Priority |
|----------|---------------------|----------------------|----------|
| VVV Circulating Supply | `venice vvv-supply` | ✅ Implemented | - |
| VVV Network Utilization | `venice vvv-utilization` | ✅ Implemented | - |
| VVV Staking Yield | `venice vvv-yield` | ✅ Implemented | - |

### 6. API Keys Endpoints

| Endpoint | Current CLI Coverage | Implementation Status | Priority |
|----------|---------------------|----------------------|----------|
| List API Keys | `venice list-keys` | ✅ Implemented | - |
| Create API Key | `venice create-key` | ✅ Implemented | - |
| Delete API Key | `venice delete-key` | ✅ Implemented | - |
| Rate Limits | `venice rate-limits` | ✅ Implemented | - |

## Implementation Plan for Missing Endpoints

### Phase 1: High Priority Implementations

#### 1. Enhanced Chat Command

First, enhance the existing chat command to support all chat-related features:

```javascript
// Update the existing chat command implementation
chat: async (prompt, options = {}) => {
  const venice = getClient();
  
  const messages = [];
  
  if (options.system) {
    messages.push({ role: 'system', content: options.system });
  }
  
  // Handle complex message content (for vision models)
  if (options.image) {
    const content = [];
    content.push({ type: 'text', text: prompt });
    
    // Handle image input (base64, URL, or file path)
    if (options.image.startsWith('data:') || options.image.match(/^[A-Za-z0-9+/=]+$/)) {
      content.push({
        type: 'image_url',
        image_url: { url: options.image }
      });
    } else if (options.image.startsWith('http')) {
      content.push({
        type: 'image_url',
        image_url: { url: options.image }
      });
    } else {
      const imageBuffer = fs.readFileSync(options.image);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = options.image.endsWith('.png') ? 'image/png' : 
                       options.image.endsWith('.jpg') || options.image.endsWith('.jpeg') ? 'image/jpeg' : 
                       'application/octet-stream';
      
      content.push({
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64Image}` }
      });
    }
    
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: prompt });
  }
  
  // Handle functions if provided
  let functions;
  if (options.functionsFile) {
    const functionsContent = fs.readFileSync(options.functionsFile, 'utf8');
    functions = JSON.parse(functionsContent);
  } else if (options.functions) {
    functions = JSON.parse(options.functions);
  }
  
  // Prepare venice_parameters
  const veniceParameters: any = {};
  
  // Web search options
  if (options.webSearch === 'on' || options.webSearch === true) {
    veniceParameters.enable_web_search = 'on';
  } else if (options.webSearch === 'off') {
    veniceParameters.enable_web_search = 'off';
  } else if (options.webSearch === 'auto') {
    veniceParameters.enable_web_search = 'auto';
  }
  
  // System prompt control
  if (options.noSystemPrompt) {
    veniceParameters.include_venice_system_prompt = false;
  }
  
  // Character interaction
  if (options.character) {
    veniceParameters.character_slug = options.character;
  }
  
  // Determine model
  let model = options.model || 'llama-3.3-70b';
  
  // Handle character in model parameter (character:slug format)
  if (model.startsWith('character:')) {
    veniceParameters.character_slug = model.replace('character:', '');
    model = 'default'; // Use default model when specifying character
  }
  
  // Handle model feature suffix
  if (options.modelFeatures) {
    model = `${model}:${options.modelFeatures}`;
  }
  
  // Create request parameters
  const requestParams: any = {
    model,
    messages,
    stream: options.stream,
  };
  
  // Add functions if provided
  if (functions) {
    requestParams.functions = functions;
    if (options.forceFunctionCall) {
      requestParams.function_call = 'auto';
    }
  }
  
  // Add venice_parameters if any are set
  if (Object.keys(veniceParameters).length > 0) {
    requestParams.venice_parameters = veniceParameters;
  }
  
  if ((global as any).debug) {
    debugLog('Chat request', requestParams);
  }
  
  const response = await venice.chat.completions.create(requestParams);
  
  if ((global as any).debug) {
    debugLog('Chat response', response);
  }
  
  // Return raw response if requested
  if (options.raw) {
    return response;
  }
  
  return response.choices[0].message.content;
}

// Update CLI command
program
  .command('chat')
  .description('Generate a chat completion')
  .argument('<prompt>', 'The prompt to send to the AI')
  .option('-m, --model <model>', 'Model to use (or character:slug for character chat)', 'llama-3.3-70b')
  .option('-w, --web-search <mode>', 'Web search mode (on, off, auto)', 'off')
  .option('-s, --system <system>', 'System message')
  .option('-i, --image <path>', 'Path to image file, URL, or base64 data (for vision models)')
  .option('-f, --functions <json>', 'JSON string of function definitions')
  .option('-F, --functions-file <path>', 'Path to JSON file with function definitions')
  .option('--force-function-call', 'Force the model to call a function')
  .option('--stream', 'Stream the response')
  .option('--no-system-prompt', 'Remove Venice system prompt')
  .option('--character <slug>', 'Character slug to use')
  .option('--model-features <features>', 'Model feature suffix (e.g., "enable_web_search=on")')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      if (options.stream) {
        // Streaming implementation
        const stream = await venice.chat.completions.create({
          model: options.model,
          messages: [
            ...(options.system ? [{ role: 'system', content: options.system }] : []),
            { role: 'user', content: prompt }
          ],
          stream: true,
          venice_parameters: {
            enable_web_search: options.webSearch ? 'on' : undefined,
            include_venice_system_prompt: options.noSystemPrompt ? false : undefined,
            ...(options.model.startsWith('character:') ? 
              { character_slug: options.model.replace('character:', '') } : {})
          }
        });
        
        for await (const chunk of stream) {
          process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }
        console.log(); // Add newline at end
      } else {
        const result = await commands.chat(prompt, options);
        
        if ((global as any).raw || options.raw) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(result);
        }
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 2. Model Traits and Compatibility Commands

```javascript
// Add to src/cli.ts commands object
listModelTraits: async (options = {}) => {
  const venice = getClient();
  const type = options.type || 'text';
  
  const response = await venice.models.traits(type);
  
  if (options.raw) {
    return response;
  }
  
  return {
    type,
    traits: response.traits,
    total: response.traits.length
  };
},

listModelCompatibility: async (options = {}) => {
  const venice = getClient();
  const type = options.type || 'text';
  
  const response = await venice.models.compatibility(type);
  
  if (options.raw) {
    return response;
  }
  
  return {
    type,
    mappings: response.mappings,
    total: Object.keys(response.mappings).length
  };
}

// Add to CLI program
program
  .command('list-model-traits')
  .description('List model traits')
  .option('-t, --type <type>', 'Model type (text, image)', 'text')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (options) => {
    try {
      const result = await commands.listModelTraits(options);
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('Model Traits:');
        console.log(`Type: ${result.type}`);
        console.log(`Total traits: ${result.total}`);
        console.table(result.traits);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

program
  .command('list-model-compatibility')
  .description('List model compatibility mappings')
  .option('-t, --type <type>', 'Model type (text, image)', 'text')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (options) => {
    try {
      const result = await commands.listModelCompatibility(options);
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('Model Compatibility Mappings:');
        console.log(`Type: ${result.type}`);
        console.log(`Total mappings: ${result.total}`);
        console.table(Object.entries(result.mappings).map(([key, value]) => ({
          'External Model': key,
          'Venice Model': value
        })));
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 3. Vision Chat Command

```javascript
// Add to src/cli.ts commands object
visionChat: async (prompt, options = {}) => {
  const venice = getClient();
  const messages = [];
  
  if (options.system) {
    messages.push({ role: 'system', content: options.system });
  }
  
  // Handle image input
  const content = [];
  content.push({ type: 'text', text: prompt });
  
  if (options.image) {
    // Handle base64 image, URL, or local file
    if (options.image.startsWith('data:') || options.image.match(/^[A-Za-z0-9+/=]+$/)) {
      content.push({
        type: 'image_url',
        image_url: { url: options.image }
      });
    } else if (options.image.startsWith('http')) {
      content.push({
        type: 'image_url',
        image_url: { url: options.image }
      });
    } else {
      const imageBuffer = fs.readFileSync(options.image);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = options.image.endsWith('.png') ? 'image/png' : 
                       options.image.endsWith('.jpg') || options.image.endsWith('.jpeg') ? 'image/jpeg' : 
                       'application/octet-stream';
      
      content.push({
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64Image}` }
      });
    }
  }
  
  messages.push({ role: 'user', content });
  
  const response = await venice.chat.completions.create({
    model: options.model || 'qwen-2.5-vl',
    messages,
    venice_parameters: options.webSearch ? {
      enable_web_search: 'on'
    } : undefined
  });
  
  return options.raw ? response : response.choices[0].message.content;
}

// Add to CLI program
program
  .command('vision-chat')
  .description('Generate a chat completion with image input')
  .argument('<prompt>', 'The text prompt to send to the AI')
  .requiredOption('-i, --image <path>', 'Path to image file, URL, or base64 data')
  .option('-m, --model <model>', 'Model to use', 'qwen-2.5-vl')
  .option('-w, --web-search', 'Enable web search')
  .option('-s, --system <system>', 'System message')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      const result = await commands.visionChat(prompt, options);
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 4. Function Calling Command

```javascript
// Add to src/cli.ts commands object
functionChat: async (prompt, options = {}) => {
  const venice = getClient();
  const messages = [];
  
  if (options.system) {
    messages.push({ role: 'system', content: options.system });
  }
  
  messages.push({ role: 'user', content: prompt });
  
  // Parse functions from file or string
  let functions = [];
  if (options.functionsFile) {
    const functionsContent = fs.readFileSync(options.functionsFile, 'utf8');
    functions = JSON.parse(functionsContent);
  } else if (options.functions) {
    functions = JSON.parse(options.functions);
  }
  
  const response = await venice.chat.completions.create({
    model: options.model || 'mistral-codestral-22b',
    messages,
    functions,
    function_call: options.forceFunctionCall ? 'auto' : undefined
  });
  
  return options.raw ? response : response.choices[0].message;
}

// Add to CLI program
program
  .command('function-chat')
  .description('Generate a chat completion with function calling')
  .argument('<prompt>', 'The prompt to send to the AI')
  .option('-m, --model <model>', 'Model to use', 'mistral-codestral-22b')
  .option('-f, --functions <json>', 'JSON string of function definitions')
  .option('-F, --functions-file <path>', 'Path to JSON file with function definitions')
  .option('--force-function-call', 'Force the model to call a function')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      const result = await commands.functionChat(prompt, options);
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (result.function_call) {
          console.log('Function Call:');
          console.log(`Name: ${result.function_call.name}`);
          console.log(`Arguments: ${result.function_call.arguments}`);
        } else {
          console.log(result.content);
        }
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 5. Image Upscaling Command

```javascript
// Add to src/cli.ts commands object
upscaleImage: async (imagePath, options = {}) => {
  const venice = getClient();
  
  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  
  const response = await venice.image.upscale({
    image: imageBuffer.toString('base64'),
    scale: parseInt(options.scale) || 2
  });
  
  if (options.raw) {
    return response;
  }
  
  // Save image if output path is provided
  if (options.output) {
    const outputPath = options.output;
    
    if (response.image) {
      // Handle base64 response
      const imageData = response.image.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
      return { success: true, savedTo: outputPath };
    } else if (response.url) {
      // Handle URL response
      await new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(response.url, function(response) {
          response.pipe(file);
          file.on('finish', () => {
            resolve();
          });
        }).on('error', (err) => {
          reject(new Error(`Error downloading image: ${err.message}`));
        });
      });
      return { success: true, savedTo: outputPath, url: response.url };
    }
  }
  
  return response;
}

// Add to CLI program
program
  .command('upscale-image')
  .description('Upscale an image')
  .argument('<image>', 'Path to the image file')
  .option('-s, --scale <factor>', 'Scale factor (2 or 4)', '2')
  .option('-o, --output <filename>', 'Output filename', 'upscaled-image.png')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (image, options) => {
    try {
      console.log('Upscaling image...');
      const result = await commands.upscaleImage(image, options);
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else if (result.savedTo) {
        console.log(`Image upscaled and saved to ${result.savedTo}`);
      } else {
        console.log('Image upscaled successfully');
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

### Phase 2: Medium Priority Implementations

#### 1. Inpainting Command

```javascript
// Add to src/cli.ts commands object
inpaintImage: async (imagePath, prompt, options = {}) => {
  const venice = getClient();
  
  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Read mask file if provided
  let maskBuffer;
  if (options.mask) {
    maskBuffer = fs.readFileSync(options.mask);
  }
  
  const params = {
    model: options.model || 'fluently-xl',
    prompt: prompt,
    negative_prompt: options.negative,
    image: imageBuffer.toString('base64'),
    mask: maskBuffer ? maskBuffer.toString('base64') : undefined,
    mask_prompt: options.maskPrompt,
    height: options.height ? parseInt(options.height) : undefined,
    width: options.width ? parseInt(options.width) : undefined,
    safe_mode: options.safeMode
  };
  
  const response = await venice.image.generate(params);
  
  if (options.raw) {
    return response;
  }
  
  // Save image if output path is provided
  if (options.output && response.images[0].url) {
    const outputPath = options.output;
    await new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      https.get(response.images[0].url, function(response) {
        response.pipe(file);
        file.on('finish', () => {
          resolve();
        });
      }).on('error', (err) => {
        reject(new Error(`Error downloading image: ${err.message}`));
      });
    });
    
    return { url: response.images[0].url, savedTo: outputPath };
  }
  
  return { url: response.images[0].url };
}

// Add to CLI program
program
  .command('inpaint-image')
  .description('Inpaint an image')
  .argument('<image>', 'Path to the image file')
  .argument('<prompt>', 'The prompt to guide inpainting')
  .option('-m, --model <model>', 'Model to use', 'fluently-xl')
  .option('--mask <path>', 'Path to mask image')
  .option('--mask-prompt <prompt>', 'Prompt to generate mask')
  .option('-n, --negative <prompt>', 'Negative prompt')
  .option('-h, --height <pixels>', 'Output height')
  .option('-w, --width <pixels>', 'Output width')
  .option('-o, --output <filename>', 'Output filename', 'inpainted-image.png')
  .option('--safe-mode', 'Enable safe mode')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (image, prompt, options) => {
    try {
      console.log('Inpainting image...');
      const result = await commands.inpaintImage(image, prompt, options);
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else if (result.savedTo) {
        console.log(`Image inpainted and saved to ${result.savedTo}`);
        console.log(`URL: ${result.url}`);
      } else {
        console.log('Image inpainted successfully');
        console.log(`URL: ${result.url}`);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 2. Enhanced List Models Command

```javascript
// Update the existing list-models command
program
  .command('list-models')
  .description('List available models')
  .option('-t, --type <type>', 'Model type (all, text, code, image)', 'all')
  .option('-l, --limit <number>', 'Limit the number of models displayed')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (options) => {
    try {
      const result = await commands.listModels({
        type: options.type,
        limit: options.limit ? parseInt(options.limit) : undefined,
        raw: options.raw || (global as any).raw
      });
      
      if (options.raw || (global as any).raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('Available Models:');
        console.log(`Total models: ${result.total}`);
        if (result.filtered !== result.total) {
          console.log(`Showing ${result.filtered} of ${result.total} models`);
        }
        console.table(result.models);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 3. Enhanced List Characters Command

```javascript
// Enhance list-characters command
program
  .command('list-characters')
  .description('List available characters')
  .option('-l, --limit <number>', 'Limit the number of characters displayed')
  .option('--web-enabled <boolean>', 'Filter by web enabled status')
  .option('--adult <boolean>', 'Filter by adult classification')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (options) => {
    try {
      // Convert string boolean parameters to actual booleans
      const webEnabled = options.webEnabled === 'true' ? true : 
                         options.webEnabled === 'false' ? false : undefined;
      const adult = options.adult === 'true' ? true : 
                    options.adult === 'false' ? false : undefined;
      
      // Get characters with filters
      const venice = getClient();
      const response = await venice.characters.list({
        isWebEnabled: webEnabled,
        isAdult: adult
      });
      
      if (options.raw || (global as any).raw) {
        console.log(JSON.stringify(response, null, 2));
        return;
      }
      
      // Format and filter characters
      let characters = response.data || [];
      console.log('Available Characters:');
      console.log(`Total characters: ${characters.length}`);
      
      // Apply limit if specified
      if (options.limit && !isNaN(parseInt(options.limit))) {
        const limit = parseInt(options.limit);
        characters = characters.slice(0, limit);
        console.log(`Showing ${characters.length} of ${response.data.length} characters`);
      }
      
      // Format characters for display
      const formattedCharacters = characters.map(character => ({
        name: character.name || 'Unnamed',
        slug: character.slug || 'N/A',
        description: (character.description || 'No description').substring(0, 40) + '...',
        model: character.modelId || 'N/A',
        webEnabled: character.webEnabled || false,
        adult: character.adult || false
      }));
      
      console.table(formattedCharacters);
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 4. Enhanced Generate Image Command

```javascript
// Enhance generate-image command
program
  .command('generate-image')
  .description('Generate an image')
  .argument('<prompt>', 'The prompt to generate an image from')
  .option('-m, --model <model>', 'Model to use (fluently-xl, stable-diffusion-3.5, flux, flux-uncensored, lustify, pony)', 'fluently-xl')
  .option('-n, --negative <prompt>', 'Negative prompt')
  .option('-s, --style <style>', 'Style preset')
  .option('-h, --height <height>', 'Image height', '1024')
  .option('-w, --width <width>', 'Image width', '1024')
  .option('-o, --output <filename>', 'Output filename', 'venice-image.png')
  .option('--safe-mode', 'Enable safe mode')
  .option('--response-format <format>', 'Response format (json or binary)', 'json')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      console.log('Generating image...');
      
      const imageParams = {
        model: options.model,
        prompt: prompt,
        negative_prompt: options.negative,
        style_preset: options.style,
        height: parseInt(options.height),
        width: parseInt(options.width),
        safe_mode: options.safeMode,
        response_format: options.responseFormat
      };
      
      const response = await venice.image.generate(imageParams);
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(response, null, 2));
        return;
      }
      
      // Download the image
      console.log('Downloading image...');
      
      const imageUrl = response.images[0].url;
      
      if (!imageUrl) {
        console.error('Error: No image URL returned from the API');
        return;
      }
      
      const file = fs.createWriteStream(options.output);
      https.get(imageUrl, function(response) {
        response.pipe(file);
        file.on('finish', () => {
          console.log(`Image saved to ${options.output}`);
        });
      }).on('error', (err) => {
        console.error('Error downloading image:', err.message);
      });
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

### Phase 3: Low Priority Implementations

#### 1. Web Search Specialized Command

```javascript
// Add to src/cli.ts commands object
webSearchChat: async (prompt, options = {}) => {
  const venice = getClient();
  const messages = [];
  
  if (options.system) {
    messages.push({ role: 'system', content: options.system });
  }
  
  messages.push({ role: 'user', content: prompt });
  
  const webSearchMode = options.webSearchMode || 'on';
  
  const response = await venice.chat.completions.create({
    model: options.model || 'llama-3.3-70b',
    messages,
    venice_parameters: {
      enable_web_search: webSearchMode
    }
  });
  
  if (options.raw) {
    return response;
  }
  
  // Format response with citations if available
  const content = response.choices[0].message.content;
  const citations = response.web_search_citations || [];
  
  if (citations.length > 0) {
    return {
      content,
      citations: citations.map((citation, index) => ({
        index: index + 1,
        url: citation.url,
        title: citation.title
      }))
    };
  }
  
  return content;
}

// Add to CLI program
program
  .command('web-search-chat')
  .description('Generate a chat completion with web search')
  .argument('<prompt>', 'The prompt to send to the AI')
  .option('-m, --model <model>', 'Model to use', 'llama-3.3-70b')
  .option('-w, --web-search-mode <mode>', 'Web search mode (on, off, auto)', 'on')
  .option('-s, --system <system>', 'System message')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      const result = await commands.webSearchChat(prompt, options);
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else if (typeof result === 'object' && result.citations) {
        console.log(result.content);
        console.log('\nCitations:');
        result.citations.forEach(citation => {
          console.log(`[${citation.index}] ${citation.title}: ${citation.url}`);
        });
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

#### 2. Model-Specific Example Commands

```javascript
// Add model-specific example commands
program
  .command('chat-with-llama')
  .description('Chat with Llama 3.3 70B model')
  .argument('<prompt>', 'The prompt to send to the AI')
  .option('-s, --system <system>', 'System message')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      const result = await commands.chat(prompt, {
        model: 'llama-3.3-70b',
        system: options.system,
        raw: options.raw || (global as any).raw
      });
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

program
  .command('chat-with-deepseek')
  .description('Chat with Deepseek 671B model')
  .argument('<prompt>', 'The prompt to send to the AI')
  .option('-s, --system <system>', 'System message')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      const result = await commands.chat(prompt, {
        model: 'deepseek-671b',
        system: options.system,
        raw: options.raw || (global as any).raw
      });
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
```

## Example Scripts

To demonstrate the usage of all endpoints, we should create example scripts for each endpoint category:

### 1. Chat Examples

```javascript
// examples/chat/vision-chat.js
const { VeniceAI } = require('../../dist');

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function visionChat() {
  try {
    // Using local image file
    const response = await venice.cli('vision-chat "What\'s in this image?" --image ./test-image.jpg');
    console.log('Response:', response);
    
    // Using URL
    const urlResponse = await venice.cli('vision-chat "Describe this image" --image https://example.com/image.jpg');
    console.log('URL Response:', urlResponse);
    
    // Using programmatic interface
    const programmaticResponse = await venice.cli('vision-chat', {
      prompt: "What's in this image?",
      image: './test-image.jpg',
      model: 'qwen-2.5-vl'
    });
    console.log('Programmatic Response:', programmaticResponse);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

visionChat();
```

```javascript
// examples/chat/function-calling.js
const { VeniceAI } = require('../../dist');

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function functionCalling() {
  try {
    // Define functions
    const functions = [
      {
        name: "get_weather",
        description: "Get the current weather in a location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA"
            },
            unit: {
              type: "string",
              enum: ["celsius", "fahrenheit"],
              description: "The temperature unit to use"
            }
          },
          required: ["location"]
        }
      }
    ];
    
    // Save functions to a file
    const fs = require('fs');
    fs.writeFileSync('weather-functions.json', JSON.stringify(functions, null, 2));
    
    // Using CLI with functions file
    const response = await venice.cli('function-chat "What\'s the weather in San Francisco?" --functions-file weather-functions.json');
    console.log('Response:', response);
    
    // Using programmatic interface
    const programmaticResponse = await venice.cli('function-chat', {
      prompt: "What's the weather in New York?",
      functions: JSON.stringify(functions),
      forceFunctionCall: true
    });
    console.log('Programmatic Response:', programmaticResponse);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

functionCalling();
```

### 2. Model Examples

```javascript
// examples/models/model-traits.js
const { VeniceAI } = require('../../dist');

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function modelTraits() {
  try {
    // Get text model traits
    const textTraits = await venice.cli('list-model-traits --type text');
    console.log('Text Model Traits:', textTraits);
    
    // Get image model traits
    const imageTraits = await venice.cli('list-model-traits --type image');
    console.log('Image Model Traits:', imageTraits);
    
    // Using programmatic interface
    const programmaticTraits = await venice.cli('list-model-traits', {
      type: 'text',
      raw: true
    });
    console.log('Programmatic Traits:', programmaticTraits);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

modelTraits();
```

### 3. Image Examples

```javascript
// examples/image/inpainting.js
const { VeniceAI } = require('../../dist');

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function inpainting() {
  try {
    // Inpainting with mask file
    const response = await venice.cli('inpaint-image ./source-image.jpg "A beautiful sunset" --mask ./mask.png --output inpainted.png');
    console.log('Response:', response);
    
    // Inpainting with mask prompt
    const promptResponse = await venice.cli('inpaint-image ./source-image.jpg "A beautiful sunset" --mask-prompt "the sky" --output inpainted-prompt.png');
    console.log('Prompt Response:', promptResponse);
    
    // Using programmatic interface
    const programmaticResponse = await venice.cli('inpaint-image', {
      image: './source-image.jpg',
      prompt: "A beautiful sunset",
      maskPrompt: "the sky",
      output: "inpainted-programmatic.png"
    });
    console.log('Programmatic Response:', programmaticResponse);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inpainting();
```

## Documentation Updates

To ensure users are aware of all CLI capabilities, we'll update the documentation:

1. **Update CLI Documentation** (`docs/cli.md`):
   - Add sections for all new commands
   - Update existing command documentation with new options
   - Add examples for each command

2. **Create Command-Specific Documentation**:
   - Create detailed documentation for complex commands
   - Include examples and use cases

3. **Update README.md**:
   - Add new commands to the CLI Quick Start section
   - Update the Key CLI Commands table
   - Add examples for new commands in the Advanced CLI Options section

## Implementation Roadmap

To achieve complete endpoint coverage, we recommend the following implementation roadmap:

1. **Phase 1 (High Priority)**:
   - Enhance the chat command to support all chat-related features
   - Implement model traits and compatibility commands
   - Implement vision chat command
   - Implement function calling command
   - Implement image upscaling command

2. **Phase 2 (Medium Priority)**:
   - Implement inpainting command
   - Enhance list models command
   - Enhance list characters command
   - Enhance generate image command
   - Create comprehensive example scripts

3. **Phase 3 (Low Priority)**:
   - Implement web search specialized command
   - Implement model-specific example commands
   - Add interactive mode for complex workflows
   - Implement batch processing capabilities

## Conclusion

By implementing this comprehensive plan, the Venice AI SDK will provide complete coverage of ALL endpoints from the Postman collection through its CLI interface. This will make the SDK a powerful and flexible tool for interacting with the Venice AI API, allowing developers to leverage the full capabilities of the API from both the command line and programmatically.

The character interaction functionality we've already documented fits seamlessly into this architecture, following the same patterns and conventions as other features. With these additional implementations, the SDK will be a truly comprehensive tool for interacting with all aspects of the Venice AI API.