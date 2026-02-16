#!/bin/bash

# Derive unique ports from workspace directory for parallel Conductor sessions
if [ -z "$PORT" ]; then
  DIR_HASH=$(echo -n "$PWD" | cksum | awk '{print $1}')
  export PORT=$(( (DIR_HASH % 2500) * 2 + 3000 ))
fi
export STORYBOOK_PORT=$(( PORT + 1 ))

echo "Starting dev server on port $PORT (Storybook on $STORYBOOK_PORT)"

npm install --legacy-peer-deps
npm run dev
