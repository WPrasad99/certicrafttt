#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Build and run services in background
docker compose up -d --build

echo "Services started 👍"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000 (nginx)"
