# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and releases now follow a calendar versioning scheme `YYYY.MM.D` aligned with Venice API drop dates.

## [Unreleased]

### Added
- Automatic postinstall symlink creation so `@venice-dev-tools/*` modules resolve after a standard `npm install`.
- `chat.createCompletionStream()` helper for parity with documented streaming API and CLI usage.

### Fixed
- CLI streaming commands now call the typed streaming helper instead of casting to `any`, so TypeScript users regain autocompletion and documentation.
- Troubleshooting docs updated to reflect the automatic installation flow (no more manual symlinks).

## [2025.11.6] - 2025-11-06

### Added
- **OpenAI-compatible API**: New `chat.completions.create()` method matching OpenAI SDK exactly
- **Middleware system**: Request/response/error interception with 6 built-in middleware (logging, timing, headers, request-ID, retry-metadata, caching)
- **Enhanced streaming utilities**: 15+ helper functions for stream processing (collectStream, mapStream, filterStream, takeStream, etc.)
- **Error recovery hints**: Machine-readable error codes with automated recovery suggestions and code examples
- **AI metadata API**: Complete SDK capability discovery system for AI agents (`getSDKMetadata()`)
- **ESM support**: Dual CJS/ESM builds with tree-shaking enabled
- **Retry handler**: Built-in exponential backoff with jitter for transient errors
- **18 TypeScript examples**: Comprehensive example suite covering all SDK features (01-18)
- **Architecture documentation**: Complete system architecture guide (400+ lines)
- **Migration guide**: Step-by-step upgrade instructions with OpenAI SDK migration path (400+ lines)
- **AI integration guide**: Complete guide for AI agents to interact with SDK (400+ lines)
- **177 unit tests**: Comprehensive test coverage for all new features (100% coverage for middleware, error recovery)

### Changed
- Deprecated `chat.createCompletion()` in favor of `chat.completions.create()` (backward compatible)
- Deprecated `chatStream` in favor of `chat.completions.create({ stream: true })` (backward compatible)
- Deprecated `imageGeneration`, `imageUpscale`, `imageStyles` in favor of unified `images` endpoint (backward compatible)
- Updated all examples to use environment variables (security fix)
- Improved type definitions with better IntelliSense support

### Fixed
- Removed 3 hardcoded API keys from example files (security issue)
- Fixed `AudioSpeechEndpoint.create()` return type
- Fixed `ImageValidator` import type inconsistencies
- Fixed type system issues for ESM compatibility

### Security
- All API keys now use environment variables
- Created `.env.example` template for secure key management
- Added security best practices to documentation

## [2025.11.5] - 2025-11-05

### Added
- Adopted calendar-based versioning to track Venice API revisions.
- Normalized all API key endpoint responses and requests to match production payloads.
- Archived historical test analysis documents under `docs/archive/testing`.

### Changed
- Cleaned up workflow and integration tests to gracefully handle optional API features.
- Refreshed repository documentation with SEO-friendly structure and up-to-date quick starts.
- Updated package metadata and README guidance for the 2025.11.5 release.

## [1.8.2] - 2025-03-02

### Added
- Browser compatibility support with dedicated webpack configuration
- Browser-specific client implementation that works in web environments
- Browser utilities for file system, path, and event operations
- Test page for browser bundle verification

### Fixed
- Node.js module compatibility issues in browser environments
- Proper export of browser utilities in the browser bundle

## [1.8.1] - 2025-03-01

### Fixed
- Image models filtering in CLI by properly passing query parameters
- Refactored CLI implementation to reduce code duplication
- Enhanced display of model traits in CLI output

## [1.8.0] - 2025-03-01

### Added
- Proper CLI functionality with global command installation
- Added "bin" field to package.json for CLI command registration
- Created separate webpack configuration for CLI build
- Fixed "command not found" error when using CLI commands

## [1.5.2] - 2025-02-28

### Fixed
- Fixed image generation CLI to handle both URL and base64 image data
- Improved error handling in image generation commands

## [1.5.1] - 2025-02-28

### Changed
- Renamed package from venice-ai-sdk-apl to venice-dev-tools
- Updated repository URLs to point to georgeglarson/venice-dev-tools
- Fixed TypeScript error with responseType property in RequestParams interface

## [1.5.0] - 2025-02-28

### Added
- New document-vision-chat example for HTML document analysis
- Enhanced error handling in example scripts
- New model compatibility examples
- Advanced image generation examples
- Character chat examples with improved error handling
- Release script for easier version management

### Changed
- Updated documentation to reference GitHub Pages
- Added links to Venice AI platform in documentation
- Improved cross-references between documentation and GitHub repository

### Removed
- PDF document support (replaced with HTML document support)

## [1.4.3] - 2025-02-15

### Added
- Support for character interaction via CLI
- Enhanced error handling for API requests
- Improved documentation for character interaction

### Fixed
- Issue with streaming responses in certain environments
- Rate limit handling for specific model types

## [1.4.2] - 2025-02-01

### Added
- Support for VVV token information endpoints
- CLI commands for VVV circulating supply, utilization, and yield
- Example scripts for VVV token information

### Fixed
- Issue with API key validation
- Error handling for rate limit responses

## [1.4.1] - 2025-01-15

### Added
- Support for image styles endpoint
- CLI command for listing available image styles
- Example script for image styles

### Fixed
- Issue with streaming responses
- Error handling for invalid API keys

## [1.4.0] - 2025-01-01

### Added
- Support for API key management
- CLI commands for listing, creating, and deleting API keys
- Example scripts for API key management
- Rate limit information for API keys

### Changed
- Improved error handling for API requests
- Enhanced documentation for API key management

## [1.3.0] - 2024-12-15

### Added
- Support for image generation
- CLI command for generating images
- Example script for image generation

### Changed
- Improved error handling for API requests
- Enhanced documentation for image generation

## [1.2.0] - 2024-12-01

### Added
- Support for web search in chat completions
- CLI option for enabling web search
- Example script for web search

### Changed
- Improved error handling for API requests
- Enhanced documentation for web search

## [1.1.0] - 2024-11-15

### Added
- Support for streaming chat completions
- CLI option for streaming responses
- Example script for streaming

### Changed
- Improved error handling for API requests
- Enhanced documentation for streaming

## [1.0.0] - 2024-11-01

### Added
- Initial release
- Support for chat completions
- CLI command for chat
- Example script for chat
- Basic documentation
