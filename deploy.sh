#!/bin/bash

# SurfSense Deployment Script for BuildingAI Integration
# This script helps deploy SurfSense for integration with BuildingAI

set -e

echo "🚀 SurfSense Integration Deployment Script"
echo "==========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your configuration before continuing."
    echo ""
    read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
fi

# Ask for deployment mode
echo ""
echo "Select deployment mode:"
echo "1) Full stack (all services including frontend)"
echo "2) Backend only (if frontend is deployed separately)"
echo "3) Development mode (with hot reload)"
read -p "Enter your choice (1-3): " mode

case $mode in
    1)
        echo ""
        echo "🏗️  Deploying full SurfSense stack..."
        docker-compose up -d
        ;;
    2)
        echo ""
        echo "🏗️  Deploying backend services only..."
        docker-compose up -d db redis backend
        ;;
    3)
        echo ""
        echo "🏗️  Starting development environment..."
        docker-compose up
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✓ Deployment initiated!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🔗 Access Points:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "   Backend API: http://localhost:${BACKEND_PORT:-8000}"
echo "   API Docs: http://localhost:${BACKEND_PORT:-8000}/docs"
echo "   pgAdmin: http://localhost:${PGADMIN_PORT:-5050}"
echo ""
echo "📚 Next Steps:"
echo "   1. Configure your domain DNS to point to this server"
echo "   2. Set up nginx using configs in docs/nginx/"
echo "   3. Install SSL certificates with certbot"
echo "   4. Test the integration using examples in docs/examples/"
echo ""
echo "📖 Full integration guide: docs/INTEGRATION.md"
echo ""
echo "✅ Deployment complete!"
