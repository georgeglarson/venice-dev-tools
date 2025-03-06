#!/bin/bash
# Venice AI SDK Test Runner
#
# This script runs all tests for the Venice AI SDK.
#
# Usage:
#   VENICE_API_KEY=your-api-key ./test/run-all-tests.sh [category]
#
# Categories:
#   all (default) - Run all tests
#   chat - Run chat API tests
#   image - Run image API tests
#   models - Run models API tests
#   api-keys - Run API keys tests
#   characters - Run characters API tests
#   vvv - Run VVV API tests
#   integration - Run integration tests

# Get the absolute path to the test directory
TEST_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$TEST_DIR/.." && pwd)"

echo "=== Venice AI SDK Test Runner ==="
echo "Project root: $PROJECT_ROOT"
echo "Test directory: $TEST_DIR"

# Load environment variables from .env file if present
if [ -f "$TEST_DIR/.env" ]; then
  export $(grep -v '^#' "$TEST_DIR/.env" | xargs)
  echo "Loaded environment variables from $TEST_DIR/.env"
fi

# Check if API key is set
if [ -z "$VENICE_API_KEY" ]; then
  echo "Warning: VENICE_API_KEY environment variable is not set"
  echo "Some tests may be skipped or fail without an API key"
fi

# Make the script executable
chmod +x "$TEST_DIR/run-all-tests.sh"

# Get the test category from the command line argument
CATEGORY=${1:-all}

# Initialize results
CHAT_RESULT=0
IMAGE_RESULT=0
MODELS_RESULT=0
API_KEYS_RESULT=0
CHARACTERS_RESULT=0
VVV_RESULT=0
INTEGRATION_RESULT=0
UPSCALE_RESULT=0

# Run upscale tests (legacy)
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "upscale" ]; then
  echo -e "\n=== Running Upscale Tests ==="
  if [ -f "$TEST_DIR/upscale/run-tests.sh" ]; then
    chmod +x "$TEST_DIR/upscale/run-tests.sh"
    cd "$TEST_DIR/upscale"
    ./run-tests.sh
    UPSCALE_RESULT=$?
    cd "$TEST_DIR"  # Return to test directory
  else
    echo "Warning: upscale test script not found"
  fi
fi

# Run chat tests
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "chat" ]; then
  echo -e "\n=== Running Chat API Tests ==="
  # First run legacy chat tests if they exist
  if [ -f "$TEST_DIR/chat/test-file-attachments.js" ]; then
    if [ -z "$VENICE_API_KEY" ]; then
      echo "Warning: VENICE_API_KEY environment variable not set, skipping file attachment tests"
    else
      echo -e "\nRunning legacy chat tests..."
      cd "$TEST_DIR/chat"
      node test-file-attachments.js
      if [ $? -ne 0 ]; then
        CHAT_RESULT=1
      fi
      cd "$TEST_DIR"  # Return to test directory
    fi
  fi
  
  # Run new chat tests if the directory exists
  if [ -d "$TEST_DIR/resources/chat" ]; then
    for TEST_FILE in "$TEST_DIR/resources/chat"/*.js; do
      if [ -f "$TEST_FILE" ]; then
        echo -e "\nRunning $(basename "$TEST_FILE")..."
        node "$TEST_FILE"
        if [ $? -ne 0 ]; then
          CHAT_RESULT=1
        fi
      fi
    done
  fi
fi

# Run image tests
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "image" ]; then
  echo -e "\n=== Running Image API Tests ==="
  if [ -d "$TEST_DIR/resources/image" ]; then
    for TEST_FILE in "$TEST_DIR/resources/image"/*.js; do
      if [ -f "$TEST_FILE" ]; then
        echo -e "\nRunning $(basename "$TEST_FILE")..."
        node "$TEST_FILE"
        if [ $? -ne 0 ]; then
          IMAGE_RESULT=1
        fi
      fi
    done
  else
    echo "Warning: image test directory not found"
  fi
fi

# Run models tests
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "models" ]; then
  echo -e "\n=== Running Models API Tests ==="
  if [ -d "$TEST_DIR/resources/models" ]; then
    for TEST_FILE in "$TEST_DIR/resources/models"/*.js; do
      if [ -f "$TEST_FILE" ]; then
        echo -e "\nRunning $(basename "$TEST_FILE")..."
        node "$TEST_FILE"
        if [ $? -ne 0 ]; then
          MODELS_RESULT=1
        fi
      fi
    done
  else
    echo "Warning: models test directory not found"
  fi
fi

# Run API keys tests
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "api-keys" ]; then
  echo -e "\n=== Running API Keys Tests ==="
  if [ -d "$TEST_DIR/resources/api-keys" ]; then
    for TEST_FILE in "$TEST_DIR/resources/api-keys"/*.js; do
      if [ -f "$TEST_FILE" ]; then
        echo -e "\nRunning $(basename "$TEST_FILE")..."
        node "$TEST_FILE"
        if [ $? -ne 0 ]; then
          API_KEYS_RESULT=1
        fi
      fi
    done
  else
    echo "Warning: api-keys test directory not found"
  fi
fi

# Run characters tests
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "characters" ]; then
  echo -e "\n=== Running Characters API Tests ==="
  if [ -d "$TEST_DIR/resources/characters" ]; then
    for TEST_FILE in "$TEST_DIR/resources/characters"/*.js; do
      if [ -f "$TEST_FILE" ]; then
        echo -e "\nRunning $(basename "$TEST_FILE")..."
        node "$TEST_FILE"
        if [ $? -ne 0 ]; then
          CHARACTERS_RESULT=1
        fi
      fi
    done
  else
    echo "Warning: characters test directory not found"
  fi
fi

# Run VVV tests
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "vvv" ]; then
  echo -e "\n=== Running VVV API Tests ==="
  if [ -d "$TEST_DIR/resources/vvv" ]; then
    for TEST_FILE in "$TEST_DIR/resources/vvv"/*.js; do
      if [ -f "$TEST_FILE" ]; then
        echo -e "\nRunning $(basename "$TEST_FILE")..."
        node "$TEST_FILE"
        if [ $? -ne 0 ]; then
          VVV_RESULT=1
        fi
      fi
    done
  else
    echo "Warning: vvv test directory not found"
  fi
fi

# Run integration tests
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "integration" ]; then
  echo -e "\n=== Running Integration Tests ==="
  if [ -d "$TEST_DIR/integration" ]; then
    for TEST_FILE in "$TEST_DIR/integration"/*.js; do
      if [ -f "$TEST_FILE" ]; then
        echo -e "\nRunning $(basename "$TEST_FILE")..."
        node "$TEST_FILE"
        if [ $? -ne 0 ]; then
          INTEGRATION_RESULT=1
        fi
      fi
    done
  else
    echo "Warning: integration test directory not found"
  fi
fi

# Summary
echo -e "\n=== Test Summary ==="
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "upscale" ]; then
  echo "Upscale Tests: $([ $UPSCALE_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "chat" ]; then
  echo "Chat API Tests: $([ $CHAT_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "image" ]; then
  echo "Image API Tests: $([ $IMAGE_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "models" ]; then
  echo "Models API Tests: $([ $MODELS_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "api-keys" ]; then
  echo "API Keys Tests: $([ $API_KEYS_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "characters" ]; then
  echo "Characters API Tests: $([ $CHARACTERS_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "vvv" ]; then
  echo "VVV API Tests: $([ $VVV_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi
if [ "$CATEGORY" = "all" ] || [ "$CATEGORY" = "integration" ]; then
  echo "Integration Tests: $([ $INTEGRATION_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
fi

# Overall result
if [ "$CATEGORY" = "all" ]; then
  if [ $UPSCALE_RESULT -eq 0 ] && [ $CHAT_RESULT -eq 0 ] && [ $IMAGE_RESULT -eq 0 ] && [ $MODELS_RESULT -eq 0 ] && [ $API_KEYS_RESULT -eq 0 ] && [ $CHARACTERS_RESULT -eq 0 ] && [ $VVV_RESULT -eq 0 ] && [ $INTEGRATION_RESULT -eq 0 ]; then
    echo -e "\n✅ All tests passed!"
    exit 0
  else
    echo -e "\n❌ Some tests failed!"
    exit 1
  fi
else
  # Check the result for the specific category
  case "$CATEGORY" in
    upscale)
      exit $UPSCALE_RESULT
      ;;
    chat)
      exit $CHAT_RESULT
      ;;
    image)
      exit $IMAGE_RESULT
      ;;
    models)
      exit $MODELS_RESULT
      ;;
    api-keys)
      exit $API_KEYS_RESULT
      ;;
    characters)
      exit $CHARACTERS_RESULT
      ;;
    vvv)
      exit $VVV_RESULT
      ;;
    integration)
      exit $INTEGRATION_RESULT
      ;;
    *)
      echo "Unknown category: $CATEGORY"
      exit 1
      ;;
  esac
fi