#!/bin/bash

# Load environment variables from the root .env file
set -a
source <(grep -v '^#' ../.env | sed -E 's/^([^=]+)=(.*)/\1="\2"/')
set +a

# Ensure the database exists
createdb -h localhost -U postgres -p 5432 "${POSTGRES_DB:-nexit_itsm}" 2>/dev/null || true

# Start the development server
pnpm dev
