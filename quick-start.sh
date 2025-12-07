#!/bin/bash

# SurfSense Quick Start Script
# This script helps you quickly set up SurfSense with minimal configuration

set -e

echo "======================================"
echo "   SurfSense Quick Start Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not available. Please install Docker Compose.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Create root .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating root .env file..."
    cp .env.example .env
    
    # Generate a secure PostgreSQL password
    if command -v openssl &> /dev/null; then
        PG_PASSWORD=$(openssl rand -base64 32)
        # Escape special characters in password for sed
        PG_PASSWORD_ESCAPED=$(echo "$PG_PASSWORD" | sed 's/[\/&]/\\&/g')
        if sed -i.bak "s/POSTGRES_PASSWORD=postgres/POSTGRES_PASSWORD=${PG_PASSWORD_ESCAPED}/" .env 2>/dev/null; then
            rm -f .env.bak
            echo -e "${GREEN}✓ Created .env file with secure password${NC}"
        else
            rm -f .env.bak
            echo -e "${YELLOW}⚠ Created .env file, but please manually set a secure POSTGRES_PASSWORD${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ OpenSSL not found. Created .env file, but please manually set a secure POSTGRES_PASSWORD${NC}"
        echo -e "${YELLOW}   You can generate one with: openssl rand -base64 32${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Root .env file already exists, skipping...${NC}"
fi

# Setup backend .env
if [ ! -f surfsense_backend/.env ]; then
    echo "Creating backend .env file..."
    cp surfsense_backend/.env.example surfsense_backend/.env
    echo -e "${GREEN}✓ Created backend .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit surfsense_backend/.env and add your API keys${NC}"
else
    echo -e "${YELLOW}⚠ Backend .env file already exists, skipping...${NC}"
fi

# Setup frontend .env
if [ ! -f surfsense_web/.env ]; then
    echo "Creating frontend .env file..."
    cp surfsense_web/.env.example surfsense_web/.env
    echo -e "${GREEN}✓ Created frontend .env file${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env file already exists, skipping...${NC}"
fi

echo ""
echo "======================================"
echo "   Configuration Setup Complete!"
echo "======================================"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Edit surfsense_backend/.env and add your API keys:"
echo "   - At minimum, add an LLM API key (e.g., OPENAI_API_KEY)"
echo "   - ETL_SERVICE is set to DOCLING by default (no API key needed)"
echo ""
echo "2. Start SurfSense:"
echo "   ${GREEN}docker compose up -d${NC}"
echo ""
echo "3. Access SurfSense:"
echo "   - Web UI: http://localhost:3000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - pgAdmin: http://localhost:5050"
echo ""
echo "4. View logs:"
echo "   ${GREEN}docker compose logs -f${NC}"
echo ""
echo "For detailed documentation, see:"
echo "   - English: DEPLOYMENT.md"
echo "   - 中文: DEPLOYMENT.zh-CN.md"
echo ""
echo "======================================"
