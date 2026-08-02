#!/usr/bin/env bash

# Run via: npm run invoke:curl
# Hits the deployed HTTP API (no AWS credentials required).

set -euo pipefail

DEPLOYED_URL="https://rqnfyvya7e.execute-api.us-east-1.amazonaws.com"

echo "=== search ==="
curl -X POST "${DEPLOYED_URL}/api/search" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -s | jq
echo
