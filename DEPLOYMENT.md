# SurfSense Deployment Guide

This guide provides comprehensive instructions for deploying SurfSense. Choose the deployment method that best suits your needs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker (Recommended)](#quick-start-with-docker-recommended)
- [Production Deployment](#production-deployment)
- [Manual Installation](#manual-installation)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying SurfSense, ensure you have:

### Required Software

- **Docker & Docker Compose** (for Docker deployment)
  - Docker Engine 20.10+
  - Docker Compose 2.0+
- **Python 3.11+** (for manual installation)
- **Node.js 18+** (for manual installation)
- **PostgreSQL 15+** with pgvector extension (for manual installation)
- **Redis 7+** (for manual installation)

### Required API Keys

At minimum, you need ONE of the following file processing services:

1. **Docling** (Default, Free) - No API key required
   - Local processing, privacy-focused
   - Supports: PDF, DOCX, HTML, images, CSV
   
2. **Unstructured.io** - Requires API key
   - Supports 34+ formats
   - Get API key: https://unstructured.io
   
3. **LlamaCloud** - Requires API key
   - Enhanced parsing, 50+ formats
   - Get API key: https://cloud.llamaindex.ai

### Optional Services

- **Authentication**: Choose between LOCAL or GOOGLE OAuth
- **LLM Providers**: OpenAI, Anthropic, Google, Azure, or Ollama (local)
- **Search Engines**: Tavily, LinkUp, or self-hosted SearxNG
- **External Integrations**: Slack, Linear, Jira, Notion, etc.

## Quick Start with Docker (Recommended)

### Automated Setup (Easiest)

We provide quick-start scripts to automate the initial setup:

**Linux/macOS:**
```bash
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan
./quick-start.sh
```

**Windows:**
```cmd
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan
quick-start.bat
```

The script will:
- Create all necessary `.env` files from examples
- Generate a secure PostgreSQL password
- Provide next steps for configuration

After running the script, follow the displayed instructions to add your API keys and start the services.

### Manual Setup

If you prefer to set up manually:

#### 1. Clone the Repository

```bash
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan
```

#### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your settings:

```bash
# Minimal Configuration
POSTGRES_PASSWORD=your_secure_password
NEXT_PUBLIC_ETL_SERVICE=DOCLING  # No API key needed

# Optional: Change default ports if needed
FRONTEND_PORT=3000
BACKEND_PORT=8000
POSTGRES_PORT=5432
```

#### 3. Configure Backend

Navigate to the backend directory and set up configuration:

```bash
cd surfsense_backend
cp .env.example .env
```

Edit `surfsense_backend/.env` with your API keys:

```bash
# LLM Configuration (choose one or more)
OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key
# GOOGLE_API_KEY=your_google_key

# File Processing (using Docling by default - no key needed)
# ETL_SERVICE=DOCLING

# Or use other services:
# ETL_SERVICE=UNSTRUCTURED
# UNSTRUCTURED_API_KEY=your_unstructured_key

# ETL_SERVICE=LLAMACLOUD
# LLAMA_CLOUD_API_KEY=your_llama_key
```

#### 4. Configure Frontend

Navigate to the frontend directory:

```bash
cd ../surfsense_web
cp .env.example .env
```

#### 5. Start the Services

Return to the root directory and start all services:

```bash
cd ..
docker-compose up -d
```

This will start:
- PostgreSQL with pgvector (port 5432)
- pgAdmin (port 5050) - Database management UI
- Redis (port 6379) - Message broker
- Backend API (port 8000)
- Frontend Web UI (port 3000)

#### 6. Access SurfSense

- **Web UI**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050 (admin@surfsense.com / surfsense)

#### 7. Initialize the Database

The database will be initialized automatically on first run. If needed, you can run migrations manually:

```bash
docker-compose exec backend alembic upgrade head
```

## Production Deployment

For production environments, additional configuration is recommended:

### 1. Enable Celery Workers

Uncomment the Celery services in `docker-compose.yml`:

```yaml
services:
  # ... existing services ...
  
  celery_worker:
    # Uncomment this entire section
    
  celery_beat:
    # Uncomment this entire section
    
  flower:
    # Uncomment this entire section for task monitoring
```

### 2. Use Pre-built Images (Optional)

To use pre-built images instead of building locally, update `docker-compose.yml`:

```yaml
backend:
  image: ghcr.io/modsetter/surfsense_backend:latest
  # Comment out the 'build' line

frontend:
  image: ghcr.io/modsetter/surfsense_ui:latest
  # Comment out the 'build' section
```

### 3. Production Environment Variables

Update your `.env` file for production:

```bash
# Use strong passwords
POSTGRES_PASSWORD=strong_random_password_here
PGADMIN_DEFAULT_PASSWORD=another_strong_password

# Production backend URL (use your domain)
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://api.yourdomain.com

# Use GOOGLE OAuth for production (recommended)
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=GOOGLE
```

### 4. SSL/TLS Configuration

For production, use a reverse proxy (nginx, Traefik, or Caddy) to handle SSL:

**Example nginx configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. Persistent Data

Ensure Docker volumes are backed up regularly:

```bash
# Backup PostgreSQL data
docker-compose exec -T db pg_dump -U postgres surfsense > backup.sql

# Restore from backup
docker-compose exec -T db psql -U postgres surfsense < backup.sql
```

## Manual Installation

For detailed manual installation instructions, refer to the official documentation:
https://www.surfsense.net/docs/manual-installation

Basic steps:

### Backend Setup

```bash
cd surfsense_backend

# Install dependencies with uv (recommended) or pip
uv pip install -e .
# or: pip install -e .

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations
alembic upgrade head

# Start the backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# In separate terminals, start Celery workers:
celery -A app.celery_app worker --loglevel=info
celery -A app.celery_app beat --loglevel=info
```

### Frontend Setup

```bash
cd surfsense_web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Build and start
npm run build
npm start
```

## Environment Configuration

### Core Environment Variables

#### Root `.env` File

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=surfsense
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Services
BACKEND_PORT=8000
FRONTEND_PORT=3000
PGADMIN_PORT=5050
FLOWER_PORT=5555

# Frontend Configuration
NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING
```

#### Backend `.env` File

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/surfsense

# Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# LLM Providers
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_API_KEY=your_key

# File Processing
ETL_SERVICE=DOCLING  # or UNSTRUCTURED or LLAMACLOUD
UNSTRUCTURED_API_KEY=your_key  # if using UNSTRUCTURED
LLAMA_CLOUD_API_KEY=your_key   # if using LLAMACLOUD

# Authentication
SECRET_KEY=generate_a_random_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Search Engines (Optional)
TAVILY_API_KEY=your_key
LINKUP_API_KEY=your_key
SEARXNG_URL=http://your-searxng-instance

# External Integrations (Optional)
SLACK_BOT_TOKEN=your_token
NOTION_API_KEY=your_key
GITHUB_TOKEN=your_token
```

## PAL MCP Integration (Optional)

For enhanced multi-model AI orchestration, you can integrate PAL MCP (DASHI):

```bash
# Clone DASHI repository (one level up from SurfSense)
cd ..
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI.git

# Return to SurfSense directory
cd yinghuogongfan

# Start with PAL MCP
docker-compose -f docker-compose.yml -f docker-compose.pal.yml up -d
```

See [docs/PAL_MCP_INTEGRATION.md](docs/PAL_MCP_INTEGRATION.md) for detailed setup instructions.

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Problem**: Backend cannot connect to PostgreSQL

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps db

# Check logs
docker-compose logs db

# Verify connection settings in .env files
# Ensure DATABASE_URL uses correct host (db for Docker, localhost for manual)
```

#### 2. Frontend Cannot Reach Backend

**Problem**: API calls from frontend fail

**Solution**:
```bash
# Verify NEXT_PUBLIC_FASTAPI_BACKEND_URL in frontend .env
# For Docker: http://backend:8000 (internal) or http://localhost:8000 (browser)
# Check backend is running:
docker-compose logs backend
```

#### 3. File Upload Errors

**Problem**: Files fail to process

**Solution**:
```bash
# Verify ETL service configuration
# Check API keys if using UNSTRUCTURED or LLAMACLOUD
# For DOCLING (default), no keys needed

# Check Celery workers are running:
docker-compose logs backend | grep celery
```

#### 4. Celery Tasks Not Processing

**Problem**: Background tasks stuck or not running

**Solution**:
```bash
# Check Redis is running
docker-compose ps redis

# Check Celery workers in backend logs
docker-compose logs backend | grep "celery worker"

# For production, uncomment and start separate celery_worker service
```

#### 5. Permission Denied Errors

**Problem**: Docker volume permission issues

**Solution**:
```bash
# Fix volume permissions
sudo chown -R $USER:$USER postgres_data pgadmin_data redis_data

# Or recreate volumes
docker-compose down -v
docker-compose up -d
```

#### 6. Port Already in Use

**Problem**: Cannot start services, port conflicts

**Solution**:
```bash
# Change ports in .env file
FRONTEND_PORT=3001
BACKEND_PORT=8001
POSTGRES_PORT=5433

# Then restart services
docker-compose down
docker-compose up -d
```

### Getting Help

- **Documentation**: https://www.surfsense.net/docs
- **Discord Community**: https://discord.gg/ejRNvftDp9
- **GitHub Issues**: https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan/issues
- **Roadmap**: https://github.com/users/MODSetter/projects/2

### Health Checks

Verify all services are running correctly:

```bash
# Check all containers
docker-compose ps

# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
```

## Next Steps

1. **Create Your First Space**: Log in and create a knowledge space
2. **Upload Documents**: Add documents to your knowledge base
3. **Configure Integrations**: Set up external data sources (Slack, GitHub, etc.)
4. **Customize LLM Settings**: Configure your preferred AI models
5. **Install Browser Extension**: Save web pages to your knowledge base
6. **Explore Features**: Try the research agent, podcast generation, and chat features

For detailed feature documentation, visit: https://www.surfsense.net/docs

---

**Note**: SurfSense is actively being developed. Check the [roadmap](https://github.com/users/MODSetter/projects/2) for upcoming features and improvements.
