# Postman Collection Integration

This directory contains scripts for working with the Venice AI Postman collection.

## Overview

The Venice AI team maintains an official Postman workspace at:
https://www.postman.com/veniceai/venice-ai-workspace/

This workspace is the source of truth for the latest API endpoints and is typically updated before the SDK.

## Scripts

### fetch-collection.js

This script helps fetch and process the Venice AI Postman collection.

```bash
# Basic usage - creates a placeholder collection
node scripts/postman/fetch-collection.js

# Extract endpoint information from the collection
node scripts/postman/fetch-collection.js --extract
```

## Manual Collection Export

Since the Venice AI Postman workspace is public but may require authentication to access via the API, you can manually export the collection:

1. Visit https://www.postman.com/veniceai/venice-ai-workspace/
2. Open the collection you want to export
3. Click the "..." menu and select "Export"
4. Save the JSON file to `postman/collections/`
5. Run `node scripts/postman/fetch-collection.js --extract` to extract endpoint information

## Directory Structure

```
postman/
├── collections/     # Raw Postman collection JSON files
└── endpoints/       # Extracted endpoint information
```

## Using the Endpoint Information

The extracted endpoint information can be used to:

1. Automatically generate SDK methods
2. Validate SDK implementation against the official API
3. Generate documentation
4. Keep the SDK in sync with the latest API changes

## Updating the SDK

When the Postman collection is updated:

1. Export the updated collection
2. Run the extraction script
3. Compare the extracted endpoints with the current SDK implementation
4. Update the SDK as needed