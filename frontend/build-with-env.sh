#!/bin/bash

# Script to load .env variables for Angular build
# This converts .env values to NG_APP_ environment variables

set -a
source .env
set +a

# Export NG_APP variables from .env
export NG_APP_API_URL=${FRONTEND_API_URL}

# Run the build
npm run build
