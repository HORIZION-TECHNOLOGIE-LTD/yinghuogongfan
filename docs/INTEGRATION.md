# SurfSense Integration Guide

This guide explains how to integrate SurfSense into an existing website or application, such as BuildingAI.

## Integration Methods

### Method 1: Subdomain Deployment (Recommended)

Deploy SurfSense on a subdomain of your main site (e.g., `surfsense.buildingai.com`).

#### Advantages:
- Complete isolation of services
- Easy to maintain and update
- No CORS issues
- Full functionality preserved

#### Setup:

1. Deploy SurfSense using Docker Compose:
```bash
# Clone the repository
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start services
docker-compose up -d
```

2. Configure your reverse proxy (nginx example):
```nginx
server {
    server_name surfsense.buildingai.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL configuration (use certbot)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/surfsense.buildingai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/surfsense.buildingai.com/privkey.pem;
}
```

3. Link from main site:
```html
<a href="https://surfsense.buildingai.com" target="_blank">
    Open SurfSense Research Assistant
</a>
```

### Method 2: Subpath Deployment

Deploy SurfSense under a subpath of your main site (e.g., `buildingai.com/surfsense`).

#### Configuration:

1. Update Next.js configuration in `surfsense_web/next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  basePath: '/surfsense',
  assetPrefix: '/surfsense',
  output: "standalone",
  // ... rest of config
};
```

2. Update backend API base path in `surfsense_backend/main.py`:
```python
app = FastAPI(
    title="SurfSense API",
    root_path="/api/surfsense"  # Add this
)
```

3. Configure nginx:
```nginx
server {
    server_name buildingai.com;
    
    location /surfsense {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/surfsense {
        rewrite ^/api/surfsense/(.*) /$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Method 3: IFrame Embedding

Embed SurfSense components in your site using iframes.

#### Example:
```html
<!DOCTYPE html>
<html>
<head>
    <title>BuildingAI - Research Assistant</title>
    <style>
        .surfsense-container {
            width: 100%;
            height: 800px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="main-content">
        <h1>BuildingAI Research Platform</h1>
        <p>Access powerful AI research tools below:</p>
        
        <!-- Embed SurfSense -->
        <iframe 
            src="https://surfsense.buildingai.com" 
            class="surfsense-container"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        ></iframe>
    </div>
</body>
</html>
```

#### Security Considerations:
Update `surfsense_web/next.config.ts` to allow iframe embedding:
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://buildingai.com',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://buildingai.com",
          },
        ],
      },
    ];
  },
};
```

### Method 4: API Integration

Use SurfSense backend API from your existing application.

#### Key API Endpoints:

**Authentication:**
```bash
POST /api/auth/register
POST /api/auth/login
```

**Research & Chat:**
```bash
POST /api/chat/research  # AI research with citations
POST /api/chat/stream    # Streaming chat responses
GET /api/spaces          # List knowledge spaces
```

**Document Management:**
```bash
POST /api/documents/upload
GET /api/documents/list
DELETE /api/documents/{id}
POST /api/documents/search
```

**Podcast Generation:**
```bash
POST /api/podcasts/generate
GET /api/podcasts/list
```

#### Example Integration:
```javascript
// In your BuildingAI application
async function researchQuery(question, spaceId) {
    const response = await fetch('https://surfsense.buildingai.com/api/chat/research', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            question: question,
            space_id: spaceId,
            search_settings: {
                top_k: 10,
                use_reranker: true
            }
        })
    });
    
    return await response.json();
}
```

### Method 5: Component Library Integration

Extract and reuse SurfSense React components in your application.

#### Setup:

1. Install dependencies:
```bash
npm install @ai-sdk/react ai lucide-react
```

2. Copy components from `surfsense_web/components` to your project

3. Use in your application:
```tsx
import { ChatInterface } from '@/components/chat/ChatInterface';
import { DocumentUploader } from '@/components/documents/DocumentUploader';

function ResearchPage() {
  return (
    <div>
      <h1>BuildingAI Research</h1>
      <ChatInterface apiEndpoint="https://surfsense.buildingai.com/api" />
      <DocumentUploader apiEndpoint="https://surfsense.buildingai.com/api" />
    </div>
  );
}
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```bash
# Frontend Configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://surfsense.buildingai.com/api
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING

# Backend Configuration
BACKEND_PORT=8000

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<secure_password>
POSTGRES_DB=surfsense
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PORT=6379

# Security
SECRET_KEY=<generate_secure_key>
ALGORITHM=HS256

# Optional: External Integrations
OPENAI_API_KEY=<your_key>
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_secret>
```

### Backend Environment Variables

Create `surfsense_backend/.env`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:<password>@db:5432/surfsense

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Authentication
SECRET_KEY=<secure_key>
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM Configuration
DEFAULT_LLM_MODEL=gpt-4
DEFAULT_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=<your_key>

# File Processing
ETL_SERVICE=DOCLING  # or UNSTRUCTURED, LLAMACLOUD
```

### Frontend Environment Variables

Create `surfsense_web/.env`:

```bash
# API Configuration
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://surfsense.buildingai.com/api
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING

# Optional: Analytics
NEXT_PUBLIC_GA_ID=<your_google_analytics_id>
```

## Single Sign-On (SSO) Integration

To integrate SurfSense authentication with your main BuildingAI site:

### Option 1: OAuth 2.0

Configure SurfSense to use your existing OAuth provider:

```python
# In surfsense_backend/app/core/config.py
OAUTH_PROVIDER_URL = "https://buildingai.com/oauth"
OAUTH_CLIENT_ID = "<your_client_id>"
OAUTH_CLIENT_SECRET = "<your_secret>"
```

### Option 2: JWT Token Sharing

Share JWT tokens between applications:

1. Use the same SECRET_KEY in both applications
2. Configure CORS properly
3. Share cookies with appropriate domain settings

```typescript
// In surfsense_web
const cookieOptions = {
  domain: '.buildingai.com',  // Share across subdomains
  secure: true,
  httpOnly: true,
  sameSite: 'lax'
};
```

## CORS Configuration

If deploying on different domains, configure CORS in the backend:

```python
# In surfsense_backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://buildingai.com",
        "https://www.buildingai.com",
        "https://surfsense.buildingai.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Monitoring & Logging

### Setup Monitoring

1. Enable Flower for Celery monitoring:
```bash
# Uncomment in docker-compose.yml
docker-compose up -d flower
```

2. Access monitoring dashboard:
```
https://surfsense.buildingai.com/flower
```

### Centralized Logging

Integrate with your existing logging infrastructure:

```python
# In surfsense_backend/app/core/logging.py
import logging
from logging.handlers import SysLogHandler

# Send logs to centralized server
handler = SysLogHandler(address=('buildingai.com', 514))
logger = logging.getLogger('surfsense')
logger.addHandler(handler)
```

## Performance Optimization

### Caching Strategy

1. Enable Redis caching for API responses
2. Use CDN for static assets
3. Configure browser caching

```nginx
location /static {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 1d;
    add_header Cache-Control "public, max-age=86400";
}
```

### Database Optimization

1. Enable connection pooling
2. Configure pgvector indexes
3. Regular maintenance tasks

```sql
-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_spaces_created_at ON spaces(created_at);
```

## Security Best Practices

1. **Enable HTTPS**: Always use SSL/TLS certificates
2. **API Rate Limiting**: Configure rate limits in nginx
3. **Input Validation**: Enable strict validation on all endpoints
4. **Regular Updates**: Keep dependencies updated
5. **Backup Strategy**: Regular database backups

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:8000;
}
```

## Troubleshooting

### Common Issues

**Issue 1: CORS Errors**
- Verify CORS settings in backend
- Check cookie domain settings
- Ensure proper protocol (http/https)

**Issue 2: Authentication Failures**
- Verify SECRET_KEY matches across services
- Check token expiration settings
- Review OAuth configuration

**Issue 3: Performance Issues**
- Monitor Redis memory usage
- Check PostgreSQL query performance
- Review Celery worker capacity

## Support

For technical support and questions:
- GitHub Issues: https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan/issues
- Discord: https://discord.gg/ejRNvftDp9
- Documentation: https://www.surfsense.net/docs

## License

This integration guide is part of the SurfSense project. See LICENSE file for details.
