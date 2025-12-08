# SurfSense Deployment Guide

This document provides a comprehensive guide for deploying and packaging SurfSense Docker images.

## Table of Contents

- [Quick Start](#quick-start)
- [Building Docker Images](#building-docker-images)
- [Deployment Options](#deployment-options)
- [Environment Configuration](#environment-configuration)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- At least 4GB available memory
- At least 10GB available disk space

### Quick Deployment with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
   cd yinghuogongfan
   ```

2. **Configure environment variables**
   ```bash
   # Copy environment variable example file
   cp .env.example .env
   
   # Edit .env file and configure necessary parameters
   vim .env
   ```

3. **Configure backend environment variables**
   ```bash
   # Copy backend environment variable example file
   cp surfsense_backend/.env.example surfsense_backend/.env
   
   # Edit backend .env file, configure API keys, etc.
   vim surfsense_backend/.env
   ```

4. **Configure frontend environment variables**
   ```bash
   # Copy frontend environment variable example file
   cp surfsense_web/.env.example surfsense_web/.env
   
   # Edit frontend .env file
   vim surfsense_web/.env
   ```

5. **Start all services**
   ```bash
   docker-compose up -d
   ```

6. **Check service status**
   ```bash
   docker-compose ps
   ```

7. **Access the application**
   - Frontend UI: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - pgAdmin: http://localhost:5050

8. **View logs**
   ```bash
   # View all service logs
   docker-compose logs -f
   
   # View specific service logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

## Building Docker Images

### Using the Build Script (Recommended)

The project provides a convenient build script `build-images.sh` with multiple build options.

#### Basic Usage

```bash
# Build all images (backend and frontend)
./build-images.sh

# Build backend only
./build-images.sh --backend-only

# Build frontend only
./build-images.sh --frontend-only

# Specify version tag
./build-images.sh --tag v1.0.0

# Build and push to registry
./build-images.sh --tag v1.0.0 --push

# Build without cache
./build-images.sh --no-cache

# Build for multiple platforms (AMD64 and ARM64)
./build-images.sh --platform linux/amd64,linux/arm64 --push
```

#### Build Options

| Option | Description | Example |
|--------|-------------|---------|
| `--backend-only` | Build backend image only | `./build-images.sh --backend-only` |
| `--frontend-only` | Build frontend image only | `./build-images.sh --frontend-only` |
| `--tag VERSION` | Specify image version tag (default: latest) | `./build-images.sh --tag v1.0.0` |
| `--registry REGISTRY` | Specify registry address | `./build-images.sh --registry your-registry.com/org` |
| `--push` | Push images to registry after build | `./build-images.sh --tag v1.0.0 --push` |
| `--no-cache` | Build without cache | `./build-images.sh --no-cache` |
| `--platform PLATFORM` | Specify target platform | `./build-images.sh --platform linux/amd64,linux/arm64` |
| `--help` | Show help message | `./build-images.sh --help` |

### Manual Image Building

If you prefer manual control over the build process, you can use Docker commands directly.

#### Build Backend Image

```bash
docker build -t surfsense_backend:latest -f surfsense_backend/Dockerfile surfsense_backend/
```

#### Build Frontend Image

```bash
docker build \
  --build-arg NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000 \
  --build-arg NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL \
  --build-arg NEXT_PUBLIC_ETL_SERVICE=DOCLING \
  -t surfsense_ui:latest \
  -f surfsense_web/Dockerfile \
  surfsense_web/
```

#### Multi-platform Builds

```bash
# Create buildx builder
docker buildx create --name multiarch --use

# Build multi-platform image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/horizion-technologie-ltd/surfsense_backend:latest \
  -f surfsense_backend/Dockerfile \
  --push \
  surfsense_backend/
```

## Deployment Options

### Option 1: Local Development Deployment

Use Docker Compose for quick deployment in local environments, suitable for development and testing.

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f
```

### Option 2: Production Deployment

For production environments, it's recommended to deploy services separately for better scalability and maintainability.

#### 2.1 Using Custom Images

```bash
# Use your own built images
docker-compose -f docker-compose.yml up -d

# Or modify the image field in docker-compose.yml
# Change build to image, for example:
# image: ghcr.io/horizion-technologie-ltd/surfsense_backend:v1.0.0
```

#### 2.2 Enable Celery Services

In production, it's recommended to enable Celery Worker, Beat, and Flower services for handling async tasks.

Edit `docker-compose.yml` and uncomment the following services:
- `celery_worker`
- `celery_beat`
- `flower`

Then restart services:

```bash
docker-compose up -d
```

#### 2.3 Configure Reverse Proxy

It's recommended to use Nginx or Caddy as a reverse proxy:

**Nginx Configuration Example:**

```nginx
upstream backend {
    server localhost:8000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 3: Kubernetes Deployment

For large-scale production environments, you can use Kubernetes for container orchestration.

```yaml
# Example Kubernetes deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: surfsense-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: surfsense-backend
  template:
    metadata:
      labels:
        app: surfsense-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/horizion-technologie-ltd/surfsense_backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: surfsense-secrets
              key: database-url
```

## Environment Configuration

### Required Environment Variables

#### Root .env File

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=surfsense
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PORT=6379

# Backend Configuration
BACKEND_PORT=8000

# Frontend Configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING

# pgAdmin Configuration
PGADMIN_PORT=5050
PGADMIN_DEFAULT_EMAIL=admin@surfsense.com
PGADMIN_DEFAULT_PASSWORD=admin_password

# Celery Configuration
FLOWER_PORT=5555
```

#### Backend .env File (surfsense_backend/.env)

Please refer to `surfsense_backend/.env.example` to configure:

- **Authentication**: OAuth keys, JWT secrets, etc.
- **LLM Configuration**: OpenAI, Anthropic, Google API keys
- **ETL Service**: Unstructured.io, LlamaCloud, or Docling
- **Search Engines**: Tavily, SearxNG, etc.
- **Integrations**: Slack, Jira, Gmail, etc.

#### Frontend .env File (surfsense_web/.env)

Please refer to `surfsense_web/.env.example` for configuration.

## Production Deployment

### Security Recommendations

1. **Use Strong Passwords**
   - Set strong passwords for all services (database, pgAdmin, auth, etc.)
   - Rotate passwords regularly

2. **Enable HTTPS**
   - Use Let's Encrypt for free SSL certificates
   - Configure reverse proxy with HTTPS support

3. **Restrict Port Access**
   - Only expose necessary ports (80, 443)
   - Use firewall to restrict other port access

4. **Data Backup**
   - Regularly backup PostgreSQL database
   - Backup configuration files and environment variables

5. **Monitoring and Logging**
   - Configure log aggregation services
   - Set up monitoring alerts

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Create necessary indexes
   -- Regularly clean old data
   -- Configure connection pooling
   ```

2. **Redis Optimization**
   - Configure persistence strategy
   - Set appropriate memory limits

3. **Application Optimization**
   - Configure Celery concurrency
   - Enable CDN for static assets
   - Use load balancer

### Scalability

1. **Horizontal Scaling**
   - Add more backend service instances
   - Add more Celery Worker instances
   - Use load balancer to distribute requests

2. **Vertical Scaling**
   - Increase server resources (CPU, memory)
   - Optimize database performance

## Image Registry

### GitHub Container Registry (GHCR)

The project uses GitHub Container Registry to host Docker images.

#### Login to GHCR

```bash
# Using GitHub Personal Access Token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

#### Pull Images

```bash
# Pull backend image
docker pull ghcr.io/horizion-technologie-ltd/surfsense_backend:latest

# Pull frontend image
docker pull ghcr.io/horizion-technologie-ltd/surfsense_ui:latest
```

#### Push Images

```bash
# Push using build script
./build-images.sh --tag v1.0.0 --push

# Or push manually
docker push ghcr.io/horizion-technologie-ltd/surfsense_backend:v1.0.0
```

### Using Other Registries

You can also use Docker Hub, Alibaba Cloud Container Registry, etc.

```bash
# Use custom registry
./build-images.sh --registry your-registry.com/org --tag v1.0.0 --push
```

## GitHub Actions Automation

The project includes GitHub Actions workflows for automatic Docker image building and publishing.

### Trigger Build

1. **Manual Trigger**
   - Go to GitHub repository Actions page
   - Select "Build and Push Docker Image" workflow
   - Click "Run workflow"
   - Select version bump type (patch, minor, major)
   - Click run

2. **Automatic Trigger**
   - Automatic build when pushing tags
   - Automatic build when merging to main branch

### Workflow Description

The project contains two main workflows:

1. **docker_build.yaml**: Build and push versioned images
2. **docker-publish.yml**: Build and push commit SHA-based images

## Troubleshooting

### 1. Image Build Failure

**Problem**: Dependency installation errors during build

**Solution**:
- Rebuild with `--no-cache` option
- Check network connection
- Ensure Docker has enough disk space

```bash
./build-images.sh --no-cache
```

### 2. Container Won't Start

**Problem**: Service fails to start with docker-compose

**Solution**:
- Check logs: `docker-compose logs -f`
- Verify environment variable configuration
- Ensure ports are not occupied
- Check database connection

### 3. Frontend Can't Connect to Backend

**Problem**: Frontend shows errors connecting to backend API

**Solution**:
- Check `NEXT_PUBLIC_FASTAPI_BACKEND_URL` environment variable
- Ensure backend service is running: `docker-compose ps`
- Check network configuration

### 4. Database Connection Failed

**Problem**: Backend cannot connect to PostgreSQL database

**Solution**:
- Check `DATABASE_URL` environment variable
- Ensure database service is started: `docker-compose ps db`
- Verify database password is correct

### 5. Image Size Too Large

**Problem**: Built Docker image is too large

**Solution**:
- Use multi-stage builds (already implemented in Dockerfile)
- Clean unnecessary cache and temp files
- Use `.dockerignore` to exclude unnecessary files

### 6. Cross-platform Build Issues

**Problem**: Issues building or running images on ARM64 architecture

**Solution**:
```bash
# Build for specific platform
./build-images.sh --platform linux/arm64

# Or build for multiple platforms
./build-images.sh --platform linux/amd64,linux/arm64 --push
```

## Maintenance and Updates

### Update Images

```bash
# Pull latest code
git pull

# Rebuild images
./build-images.sh --no-cache

# Restart services
docker-compose down
docker-compose up -d
```

### Database Migration

```bash
# Enter backend container
docker-compose exec backend bash

# Run database migration
alembic upgrade head
```

### Clean Old Images

```bash
# Remove unused images
docker image prune -a

# Clean all unused resources
docker system prune -a --volumes
```

## Support

If you encounter issues during deployment:

1. Check [GitHub Issues](https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan/issues)
2. Join [Discord Community](https://discord.gg/ejRNvftDp9)
3. Refer to [Official Documentation](https://www.surfsense.net/docs/)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.
