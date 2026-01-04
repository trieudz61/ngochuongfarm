#!/bin/bash

# Script deploy lên server có Node.js
echo "🚀 Starting deployment..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Copy files to server (thay đổi thông tin server)
echo "📤 Uploading files..."
# rsync -avz --delete ./ user@your-server.com:/path/to/your/app/

# SSH vào server và restart
echo "🔄 Restarting server..."
# ssh user@your-server.com "cd /path/to/your/app && npm install && pm2 restart app"

echo "✅ Deployment completed!"