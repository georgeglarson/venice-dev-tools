#!/bin/bash

# Venice AI SDK Release Publishing Script
# Version: 2025.11.22

set -e  # Exit on error

echo "🚀 Venice AI SDK v2025.11.22 Release Publisher"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

VERSION="2025.11.22"
TAG="v${VERSION}"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in the venice-dev-tools root directory!"
    exit 1
fi

print_info "Current directory: $(pwd)"
echo ""

# Step 1: Check Git status
echo "📋 Step 1: Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes!"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "chore: release v${VERSION}"
        print_success "Changes committed"
    else
        print_error "Please commit or stash your changes first"
        exit 1
    fi
else
    print_success "Working directory clean"
fi
echo ""

# Step 2: Create and push Git tag
echo "🏷️  Step 2: Creating Git tag..."
if git rev-parse "$TAG" >/dev/null 2>&1; then
    print_warning "Tag $TAG already exists"
    read -p "Do you want to delete and recreate it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag -d "$TAG"
        git push origin ":$TAG" 2>/dev/null || true
        print_info "Old tag deleted"
    else
        print_error "Cannot proceed with existing tag"
        exit 1
    fi
fi

git tag -a "$TAG" -m "Release v${VERSION} - 100% Swagger Compliant"
print_success "Tag created: $TAG"

read -p "Push tag to GitHub? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin "$TAG"
    print_success "Tag pushed to GitHub"
else
    print_warning "Tag not pushed. You can push it later with: git push origin $TAG"
fi
echo ""

# Step 3: Create GitHub Release
echo "📦 Step 3: Creating GitHub Release..."
if command -v gh &> /dev/null; then
    print_info "GitHub CLI found"
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        print_success "GitHub CLI authenticated"
        
        read -p "Create GitHub release now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gh release create "$TAG" \
                --title "Venice AI SDK v${VERSION} - 100% Swagger Compliant" \
                --notes-file GITHUB_RELEASE_v${VERSION}.md \
                --latest
            print_success "GitHub release created!"
        else
            print_warning "Skipping GitHub release creation"
            print_info "You can create it later with:"
            echo "gh release create $TAG --title \"Venice AI SDK v${VERSION} - 100% Swagger Compliant\" --notes-file GITHUB_RELEASE_v${VERSION}.md --latest"
        fi
    else
        print_warning "GitHub CLI not authenticated"
        print_info "Authenticate with: gh auth login"
        print_info "Then create release with:"
        echo "gh release create $TAG --title \"Venice AI SDK v${VERSION} - 100% Swagger Compliant\" --notes-file GITHUB_RELEASE_v${VERSION}.md --latest"
    fi
else
    print_warning "GitHub CLI not found"
    print_info "Install it from: https://cli.github.com"
    print_info "Or create release manually at:"
    echo "https://github.com/georgeglarson/venice-dev-tools/releases/new?tag=$TAG"
fi
echo ""

# Step 4: Publish to npm
echo "📦 Step 4: Publishing to npm..."

# Check if logged in to npm
if npm whoami &> /dev/null; then
    NPM_USER=$(npm whoami)
    print_success "Logged in to npm as: $NPM_USER"
    
    read -p "Publish to npm now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Dry run first
        print_info "Running dry-run first..."
        cd venice-ai-sdk/packages/core
        npm publish --dry-run
        
        echo ""
        read -p "Dry-run successful. Proceed with actual publish? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm publish --access public
            print_success "Published @venice-dev-tools/core@${VERSION} to npm!"
            
            # Verify publication
            sleep 2
            print_info "Verifying publication..."
            npm view @venice-dev-tools/core@${VERSION} version
            print_success "Verification successful!"
        else
            print_warning "Skipping npm publish"
        fi
        cd ../../..
    else
        print_warning "Skipping npm publish"
        print_info "You can publish later with:"
        echo "cd venice-ai-sdk/packages/core && npm publish --access public"
    fi
else
    print_warning "Not logged in to npm"
    print_info "Login with: npm login"
    print_info "Then publish with:"
    echo "cd venice-ai-sdk/packages/core && npm publish --access public"
fi
echo ""

# Step 5: Summary
echo "📊 Release Summary"
echo "=================="
print_success "Version: $VERSION"
print_success "Tag: $TAG"
echo ""
echo "📝 Next Steps:"
echo "1. Update CHANGELOG.md with entry from CHANGELOG_ENTRY.md"
echo "2. Post social media announcements (see SOCIAL_MEDIA_POSTS.md)"
echo "3. Monitor GitHub issues and npm downloads"
echo "4. Respond to community feedback"
echo ""
echo "📁 Social Media Posts Ready:"
echo "   - Twitter/X"
echo "   - LinkedIn"
echo "   - Facebook"
echo "   - Bluesky"
echo "   - Discord/Slack"
echo "   - Reddit"
echo ""
print_success "Release process complete! 🎉"
echo ""
echo "🔗 Quick Links:"
echo "   GitHub: https://github.com/georgeglarson/venice-dev-tools"
echo "   npm: https://www.npmjs.com/package/@venice-dev-tools/core"
echo "   Release: https://github.com/georgeglarson/venice-dev-tools/releases/tag/$TAG"
