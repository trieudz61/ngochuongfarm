#!/bin/bash
# Deploy script for Railway backend

echo "🚀 Starting backend deployment..."

# Navigate to server directory
cd server

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Start server
echo "🔥 Starting server..."
npm start