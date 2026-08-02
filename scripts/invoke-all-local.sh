#!/usr/bin/env bash

# Run via: npm run invoke:local
# Requires BONSAI_URL in the environment.

set -euo pipefail

export SLS_AWS_SDK=3

echo "=== search ==="
serverless invoke local -f search
echo
