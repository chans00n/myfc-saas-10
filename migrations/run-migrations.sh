#!/bin/bash

# Extract database connection details from DATABASE_URL
if [ -f ../.env.local ]; then
  source ../.env.local
  echo "Loaded environment from ../.env.local"
elif [ -f .env.local ]; then
  source .env.local
  echo "Loaded environment from .env.local"
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set in the environment"
  exit 1
fi

echo "Running migration: add-theme-column.sql"
# Run the SQL script
echo "$DATABASE_URL" | grep -o "postgresql://[^:]*:[^@]*@[^:]*:[^/]*/[^?]*" | xargs -I{} psql {} -f add-theme-column.sql

echo "Migration completed" 