# Venice AI Postman Collection

This directory contains the Venice AI Postman collection and extracted endpoint information.

## Overview

The Venice AI team maintains an official Postman workspace at:
https://www.postman.com/veniceai/venice-ai-workspace/

This workspace is the source of truth for the latest API endpoints and is typically updated before the SDK.

## Directory Structure

```
postman/
├── collections/     # Raw Postman collection JSON files
└── endpoints/       # Extracted endpoint information
```

## Updating the Collection

To update the collection:

1. Visit https://www.postman.com/veniceai/venice-ai-workspace/
2. Export the collection from the Postman UI
3. Save it to the `collections` directory
4. Run the extraction script to update the endpoint information:

```bash
node scripts/postman/fetch-collection.js --extract
```

## Using the Collection

The Postman collection can be imported into Postman to test the API directly:

1. Open Postman
2. Click "Import" and select the collection JSON file
3. Set up an environment with your API key
4. Start testing the API

## Endpoint Information

The `endpoints` directory contains extracted information about the API endpoints in a structured JSON format. This information is used to:

1. Validate the SDK implementation against the official API
2. Generate documentation
3. Keep the SDK in sync with the latest API changes

## Important Notes

- The Postman collection is the source of truth for the API
- Always check the collection for the latest endpoints and parameters
- The SDK should be updated to match the collection when changes are detected