#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Stop and remove services
docker compose down

echo "Services stopped 👋"
