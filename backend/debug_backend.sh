#!/bin/bash

echo "🚀 Stopping existing backend processes..."
pkill -f "ts-node" || true
pkill -f "nodemon" || true
pkill -f "node dist/server.js" || true

echo "🔨 Building backend..."
npm run build

echo "✅ Starting Backend on Port 3001..."
# Run in background
PORT=3001 npm start &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "🌐 Starting ngrok on Port 3001..."
echo "Copy the URL below and update your Twilio Webhook:"
echo "---------------------------------------------------"
npx ngrok http 3001
