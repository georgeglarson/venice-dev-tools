# Source files
src/
*.ts
!*.d.ts

# Tests
**/__tests__/
**/__integration__/
**/*.test.ts
**/*.spec.ts
vitest.config.ts
coverage/

# Development files
.env
.env.*
tsconfig.json
tsconfig.*.json
.eslintrc*
.prettierrc*
.editorconfig

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml

# Documentation (keep README)
docs/
*.md
!README.md

# Build artifacts
.turbo/
.cache/
tmp/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Misc
.DS_Store
Thumbs.db
# Contributing to Venice AI SDK

Thank you for your interest in contributing to the Venice AI SDK! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/georgeglarson/venice-dev-tools.git
cd venice-dev-tools
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your Venice.ai API keys to .env
```

4. Build the project:
```bash
pnpm build
```

## Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
# Requires valid API keys in .env
pnpm test:integration
```

### Coverage
```bash
pnpm test:coverage
```

## Code Quality

- **TypeScript**: Strict mode enabled, all code must be fully typed
- **Testing**: New features require unit tests (80% coverage minimum)
- **Formatting**: Code is auto-formatted on commit
- **Linting**: All code must pass ESLint checks

## Commit Guidelines

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Build/tooling changes

Example:
```bash
git commit -m "feat: add audio transcription endpoint"
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with clear description
6. Address review feedback

## Project Structure

```
venice-ai-sdk/
├── packages/
│   ├── core/        # Core SDK logic
│   ├── node/        # Node.js specific
│   └── web/         # Browser specific
├── docs/            # Documentation
└── examples/        # Usage examples
```

## Questions?

Open an issue or discussion on GitHub.
