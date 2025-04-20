#!/bin/bash

# Exit on any error
set -e

# Check for Fly.io API token
if [ -z "$FLY_API_TOKEN" ]; then
    echo "Error: FLY_API_TOKEN environment variable is not set"
    echo "Please set it with: export FLY_API_TOKEN='your-token-here'"
    exit 1
fi

echo "Starting deployment process..."

# Function to check service health
check_health() {
    local url=$1
    local max_attempts=$2
    local attempt=1
    
    echo "Checking health of $url"
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url/api/health" > /dev/null; then
            echo "Service is healthy!"
            return 0
        fi
        echo "Attempt $attempt of $max_attempts - Service not ready yet..."
        sleep 10
        attempt=$((attempt + 1))
    done
    echo "Service failed to become healthy"
    return 1
}

# Deploy main application
echo "Deploying main application..."
fly deploy --remote-only

# Wait for main application to be ready
echo "Waiting for main application to start..."
sleep 30

# Check main application health
check_health "https://trading-assistant-divine-frost-7376.fly.dev" 6 || exit 1

echo "Deployment completed successfully!"