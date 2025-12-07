# SurfSense Integration Documentation

This directory contains documentation and examples for integrating SurfSense into other websites and applications, such as BuildingAI.

## 📚 Documentation Files

### Core Documentation
- **[INTEGRATION.md](INTEGRATION.md)** - Complete integration guide covering all deployment methods
  - Subdomain deployment
  - Subpath deployment
  - iframe embedding
  - API integration
  - Component library usage

### Configuration Files

#### Nginx Configuration (`nginx/`)
- **surfsense-subdomain.conf** - Deploy on a subdomain (e.g., `surfsense.buildingai.com`)
- **surfsense-subpath.conf** - Deploy under a subpath (e.g., `buildingai.com/surfsense`)
- **surfsense-iframe.conf** - Configure for iframe embedding with proper CORS/CSP headers

### Example Files (`examples/`)

#### HTML Examples
- **integration-example.html** - Full page example embedding SurfSense via iframe
  - Chinese (中文) interface
  - Demonstrates iframe integration
  - Includes messaging between parent and iframe
  
- **api-integration-example.html** - API integration demonstration
  - Shows how to use SurfSense REST API
  - Includes authentication, research queries, document upload
  - Works as a standalone testing tool

## 🚀 Quick Start Integration Guide

### Option 1: Subdomain (Recommended)

**Best for:** Production deployments where you want SurfSense to be a first-class service

1. Deploy SurfSense with Docker:
   ```bash
   docker-compose up -d
   ```

2. Configure nginx using `nginx/surfsense-subdomain.conf`

3. Set up DNS:
   ```
   surfsense.buildingai.com → Your server IP
   ```

4. Link from main site:
   ```html
   <a href="https://surfsense.buildingai.com">AI Research</a>
   ```

### Option 2: iframe Embedding

**Best for:** Integrating SurfSense UI directly into existing pages

1. Deploy SurfSense on a subdomain

2. Configure CORS using `nginx/surfsense-iframe.conf`

3. Embed in your page:
   ```html
   <iframe 
     src="https://surfsense.buildingai.com"
     width="100%" 
     height="800px"
     allow="clipboard-read; clipboard-write"
   ></iframe>
   ```

See `examples/integration-example.html` for a complete working example.

### Option 3: API Integration

**Best for:** Building custom UI while leveraging SurfSense backend

1. Deploy SurfSense backend

2. Use the REST API:
   ```javascript
   // Login
   const response = await fetch('https://surfsense.buildingai.com/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     body: new URLSearchParams({ username: email, password: password })
   });
   const { access_token } = await response.json();

   // Research query
   const research = await fetch('https://surfsense.buildingai.com/api/chat/research', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${access_token}`
     },
     body: JSON.stringify({ question: "Your question here" })
   });
   ```

See `examples/api-integration-example.html` for a complete API testing interface.

## 🔧 Configuration Guide

### Environment Variables

Create `.env` file in the root directory:

```bash
# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://surfsense.buildingai.com/api
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING

# Backend
BACKEND_PORT=8000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=surfsense
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379
```

### Security Configuration

For iframe embedding, update `surfsense_web/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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

## 📖 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get access token

### Research & Chat
- `POST /api/chat/research` - AI research with citations
- `POST /api/chat/stream` - Streaming chat
- `GET /api/spaces` - List knowledge spaces

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/list` - List documents
- `DELETE /api/documents/{id}` - Delete document

### Podcasts
- `POST /api/podcasts/generate` - Generate podcast
- `GET /api/podcasts/list` - List podcasts

## 🔐 Authentication Methods

### Local Authentication (Default)
Users register and login with email/password.

### OAuth Integration
Configure OAuth in backend `.env`:
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
```

### SSO Integration
Share JWT tokens between BuildingAI and SurfSense:
1. Use same SECRET_KEY in both applications
2. Configure proper CORS settings
3. Share cookies with same domain

## 🎨 Customization

### Branding
To customize SurfSense for BuildingAI branding:

1. Update `surfsense_web/app/layout.tsx` metadata
2. Replace logo in `surfsense_web/public/`
3. Modify color scheme in `surfsense_web/tailwind.config.js`

### Custom Features
Add BuildingAI-specific features:
1. Create custom API endpoints in `surfsense_backend/app/api/`
2. Add custom components in `surfsense_web/components/`

## 📊 Monitoring

### Health Checks
- Frontend: `https://surfsense.buildingai.com/`
- Backend: `https://surfsense.buildingai.com/api/health`

### Logs
View logs:
```bash
# Frontend logs
docker logs surfsense-frontend

# Backend logs
docker logs surfsense-backend

# Database logs
docker logs surfsense-db
```

### Celery Monitoring
Enable Flower in `docker-compose.yml` and access:
```
https://surfsense.buildingai.com/flower
```

## 🐛 Troubleshooting

### CORS Issues
If seeing CORS errors:
1. Check nginx configuration includes proper CORS headers
2. Verify `NEXT_PUBLIC_FASTAPI_BACKEND_URL` is correct
3. Ensure cookies have proper `SameSite` settings

### Authentication Issues
If login fails:
1. Verify `SECRET_KEY` is set in backend
2. Check token expiration settings
3. Review CORS credentials settings

### Performance Issues
If slow performance:
1. Enable Redis caching
2. Configure pgvector indexes
3. Optimize nginx caching settings

## 📝 Support

For issues and questions:
- GitHub Issues: https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan/issues
- Discord: https://discord.gg/ejRNvftDp9
- Documentation: https://www.surfsense.net/docs

## 📜 License

See the main [LICENSE](../LICENSE) file in the repository root.
