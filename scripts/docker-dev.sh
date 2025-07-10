#!/bin/bash

echo "🚀 Setting up Tillu POS System for Development with Docker..."

echo "🔨 Building development Docker images..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Starting development services with hot reload..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "✅ Tillu POS Development Environment is now running!"
echo ""
echo "📱 Access the applications:"
echo "   • POS Terminal:      http://localhost:3001 (Hot Reload)"
echo "   • Customer PWA:      http://localhost:3002 (Hot Reload)"
echo "   • Manager Dashboard: http://localhost:3003 (Hot Reload)"
echo "   • Kitchen Display:   http://localhost:3004 (Hot Reload)"
echo "   • API Gateway:       http://localhost:3000 (Hot Reload + Debug)"
echo ""
echo "🐛 Debug API Gateway: Connect to localhost:9229"
echo "📊 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
