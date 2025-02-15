#!/bin/bash
echo "This script will set your Xivi environment to production."
echo "Are you sure you want to continue? (y/N)"
read -r response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Setting up environment..."
    echo "NODE_ENV=production" > .env
    echo "Please enter your Groq API key (press enter if you don't have one, this means Xivi Agent won't work):"
    read -r groq_api_key
    echo "GROQ_API_KEY=$groq_api_key" >> .env
    echo "Finished setting up environment."
    echo "Please run 'bun run build' and 'bun run start' to start Xivi."
else
    echo "Aborted."
    exit 1
fi