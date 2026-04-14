#!/bin/sh

set -eu

echo "Starting Acquisitions production stack"

if [ ! -f .env.production ]; then
  echo "Error: .env.production file not found."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is not running."
  exit 1
fi

docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

echo "Production stack is running on http://localhost:${PORT:-3000}"
