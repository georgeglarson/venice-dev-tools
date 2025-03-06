# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2025-03-06

### Changed
- Bumped subversion for npm release
- Updated dependencies
- Improved stability and performance
- Updated file upload documentation to clarify 4.5MB limit
- Removed large file handling functionality
- Updated document handling to use HTML instead of PDF
- Added new example for image upscaling

### Added
- New comprehensive file handling documentation
- Detailed image API reference documentation

### Contributors
- blueeyesmoki

## [1.8.4] - 2025-03-05

### Fixed
- Bug fixes and performance improvements
- Enhanced error handling

## [1.8.3] - 2025-03-04

### Changed
- Minor improvements and optimizations
- Documentation updates

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