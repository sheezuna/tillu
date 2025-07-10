#!/bin/bash

echo "🚀 Setting up Tillu POS System with Docker..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please update the .env file with your API keys before running the system."
fi

echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service health..."
docker-compose ps

echo "✅ Tillu POS System is now running!"
echo ""
echo "📱 Access the applications:"
echo "   • POS Terminal:      http://localhost:3001"
echo "   • Customer PWA:      http://localhost:3002"
echo "   • Manager Dashboard: http://localhost:3003"
echo "   • Kitchen Display:   http://localhost:3004"
echo "   • API Gateway:       http://localhost:3000"
echo ""
echo "🗄️  Database access:"
echo "   • PostgreSQL:        localhost:5432"
echo "   • Redis:             localhost:6379"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
