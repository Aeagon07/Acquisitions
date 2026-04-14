#!/bin/sh

set -eu

echo "Starting Acquisitions development stack"

if [ ! -f .env.development ]; then
  echo "Error: .env.development file not found."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is not running."
  exit 1
fi

mkdir -p .neon_local

docker compose -f docker-compose.dev.yml --env-file .env.development up --build
