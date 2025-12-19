#!/bin/bash

# Start Backend Server
echo "Starting AI Marketplace Backend..."
cd /Users/mohtashimnawaz/Desktop/ai-marketplace/backend

# Kill any existing process on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start backend
npx nodemon src/index.ts &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo "Waiting for server to be ready..."
sleep 5

# Test if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✓ Backend is running!"
    
    # Run integration tests
    echo ""
    echo "Running integration tests..."
    node test-integration.js
    
    TEST_RESULT=$?
    
    # Keep backend running if tests passed
    if [ $TEST_RESULT -eq 0 ]; then
        echo ""
        echo "✓ All tests passed! Backend is still running."
        echo "Press Ctrl+C to stop the backend server."
        wait $BACKEND_PID
    else
        echo ""
        echo "✗ Tests failed. Stopping backend..."
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
else
    echo "✗ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
