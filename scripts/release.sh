#!/bin/bash

# Script to handle the release process for venice-ai-sdk-apl

# Exit on error
set -e

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm and try again."
    exit 1
fi

# Function to display usage information
function show_usage {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  --push-release    Push the release to GitHub and npm"
    echo "  --create-dev      Create and switch to a dev branch"
    echo "  --help            Display this help message"
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

PUSH_RELEASE=false
CREATE_DEV=false

for arg in "$@"; do
    case $arg in
        --push-release)
            PUSH_RELEASE=true
            ;;
        --create-dev)
            CREATE_DEV=true
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            show_usage
            exit 1
            ;;
    esac
done

# Get the current version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "Current version: $VERSION"

if [ "$PUSH_RELEASE" = true ]; then
    echo "Preparing to push version $VERSION to GitHub and npm..."
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "There are uncommitted changes. Please commit or stash them before pushing."
        exit 1
    fi
    
    # Check if we're on the main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo "Warning: You are not on the main branch. Current branch: $CURRENT_BRANCH"
        read -p "Do you want to continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Create a git tag for the release
    echo "Creating git tag v$VERSION..."
    git tag -a "v$VERSION" -m "Release v$VERSION"
    
    # Push to GitHub
    echo "Pushing to GitHub..."
    git push origin main
    git push origin "v$VERSION"
    
    # Publish to npm
    echo "Publishing to npm..."
    npm publish
    
    echo "Release v$VERSION has been pushed to GitHub and published to npm."
fi

if [ "$CREATE_DEV" = true ]; then
    echo "Creating and switching to a dev branch..."
    
    # Create a new dev branch based on the current version
    DEV_BRANCH="dev-v$VERSION"
    
    # Check if the branch already exists
    if git show-ref --verify --quiet "refs/heads/$DEV_BRANCH"; then
        echo "Branch $DEV_BRANCH already exists."
        read -p "Do you want to switch to it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git checkout "$DEV_BRANCH"
            echo "Switched to branch $DEV_BRANCH"
        fi
    else
        # Create and switch to the new branch
        git checkout -b "$DEV_BRANCH"
        echo "Created and switched to branch $DEV_BRANCH"
        
        # Push the new branch to GitHub
        read -p "Do you want to push the new branch to GitHub? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push -u origin "$DEV_BRANCH"
            echo "Pushed branch $DEV_BRANCH to GitHub"
        fi
    fi
fi

echo "Done!"