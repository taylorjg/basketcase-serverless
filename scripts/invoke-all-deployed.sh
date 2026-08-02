#!/usr/bin/env bash

# Run via: npm run invoke:deployed
# Requires AWS credentials, a deployed stack, and BONSAI_URL in the environment.

set -euo pipefail

export SLS_AWS_SDK=3

echo "=== search ==="
serverless invoke -f search
echo
