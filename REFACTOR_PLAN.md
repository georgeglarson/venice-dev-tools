# Documentation Architecture Audit
*Technical Documentation Architect - Nov 6, 2025*

## Issues Found

### 1. Swagger/OpenAPI Schema (STALE)
- `venice-ai-sdk/swagger.yaml` - Last updated March 2025
- **CRITICAL**: Should be auto-fetched from Venice API
- Location: Should be in `docs/api/` not monorepo root

### 2. Duplicate/Confusing Examples
**Root `/examples/`**:
- qwen-vision-curl-example.sh
- qwen-vision-example.js  
- venice-vision-stream-cli.sh

**vs `/examples/typescript/`**:
- 01-hello-world.ts
- 02-streaming-chat.ts
- 11-vision-multimodal.ts

**Problem**: Mixed languages, no clear progression, old examples compete with new

### 3. Missing Documentation Standards
- No API reference docs
- No CONTRIBUTING guide for docs
- No documentation testing
- No automated OpenAPI sync

### 4. Repository Organization
```
CURRENT (Messy):
/examples/                    # Mix of shell/JS
  qwen-vision-example.js
  /typescript/                # Organized TS examples
    01-hello-world.ts

SHOULD BE:
/examples/
  /quickstart/               # Minimal, language-agnostic
  /typescript/               # Complete TS examples
  /javascript/               # CommonJS examples
  /shell/                    # curl/CLI examples
```

## Recommended Actions

### Phase 1: API Schema Management
1. Fetch fresh OpenAPI spec from Venice
2. Move to `docs/api/openapi.yaml`
3. Create update script: `scripts/update-api-schema.sh`
4. Add to CI/CD

### Phase 2: Examples Reorganization
1. Move shell examples → `/examples/shell/`
2. Move JS examples → `/examples/javascript/`
3. Create `/examples/quickstart/` for minimal starter
4. Update examples README with clear paths

### Phase 3: Documentation Structure
```
docs/
├── api/
│   ├── openapi.yaml        # Fresh from Venice
│   ├── README.md           # API reference
│   └── endpoints/          # Auto-generated
├── guides/
│   ├── getting-started.md  # Beginner friendly
│   ├── migration.md        # Already done ✓
│   └── advanced/           # Pro topics
├── architecture/
│   ├── overview.md         # Already done ✓
│   └── diagrams/           # Mermaid files
└── contributing/
    ├── documentation.md    # Doc standards
    ├── examples.md         # Example standards
    └── api-updates.md      # How to sync API
```

### Phase 4: Automation
- `scripts/update-api-schema.sh` - Fetch latest OpenAPI
- `scripts/validate-examples.sh` - Test all examples run
- `scripts/generate-api-docs.sh` - Auto-gen from OpenAPI
- GitHub Actions for above

# Documentation Excellence Refactor - In Progress

## Current Status
Working on `refactor/documentation-excellence` branch

## Completed
1. Created `.doc-audit.md` with full analysis
2. Created directory structure:
   - docs/api/
   - scripts/
   - examples/shell/
   - examples/javascript/
   - examples/quickstart/

## Next Steps

### 1. Reorganize Examples (Priority)
```bash
# Move shell scripts
git mv examples/qwen-vision-curl-example.sh examples/shell/
git mv examples/venice-vision-stream-cli.sh examples/shell/
git mv examples/qwen-vision-curl.sh examples/shell/

# Move JS examples
git mv examples/qwen-vision-example.js examples/javascript/

# Keep typescript/ where it is (already organized)
```

### 2. Create Update Scripts
- `scripts/update-api-schema.sh` - Fetch OpenAPI from Venice
- `scripts/validate-examples.sh` - Test all examples
- Make executable with chmod +x

### 3. Update Documentation
- examples/README.md - Update paths
- docs/contributing/examples.md - Standards guide
- docs/api/README.md - API reference

### 4. Remove Stale Files
- venice-ai-sdk/swagger.yaml (March 2025 - STALE)
- Any other outdated files found

### 5. Create Quickstart
- examples/quickstart/README.md - 5-minute guide
- Minimal hello-world that works immediately

## Branch
`refactor/documentation-excellence`

## Files to Commit
After reorganization, commit with:
```
feat: reorganize documentation and examples for clarity

- Moved shell examples to examples/shell/
- Moved JS examples to examples/javascript/
- Created examples/quickstart/ for beginners
- Added scripts/ for automation
- Removed stale swagger.yaml
- Created OpenAPI update script
```
