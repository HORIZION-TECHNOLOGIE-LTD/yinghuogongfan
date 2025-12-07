# SurfSense Integration Deployment Checklist

Use this checklist when deploying SurfSense for integration with BuildingAI or other sites.

## Pre-Deployment

### Prerequisites
- [ ] Server with Docker and Docker Compose installed
- [ ] Domain name configured (e.g., surfsense.buildingai.com)
- [ ] SSL certificate (or certbot for Let's Encrypt)
- [ ] Required API keys obtained:
  - [ ] OpenAI API key (or other LLM provider)
  - [ ] ETL service key (Unstructured.io, LlamaCloud) OR using Docling (no key needed)
  - [ ] OAuth credentials (if using OAuth)

### Configuration Files
- [ ] `.env` file created in root directory
- [ ] `surfsense_backend/.env` configured with:
  - [ ] Database credentials
  - [ ] Redis connection
  - [ ] LLM API keys
  - [ ] Secret keys for JWT
  - [ ] ETL service configuration
- [ ] `surfsense_web/.env` configured with:
  - [ ] Backend API URL
  - [ ] Authentication type
  - [ ] ETL service type

## Deployment Steps

### 1. Basic Deployment
- [ ] Clone repository to server
- [ ] Copy and edit `.env` files
- [ ] Run `docker-compose up -d` or use `./deploy.sh`
- [ ] Verify all containers are running: `docker-compose ps`
- [ ] Check logs for errors: `docker-compose logs`

### 2. Database Setup
- [ ] Database created and initialized
- [ ] pgvector extension enabled
- [ ] Database migrations applied (automatic on first run)
- [ ] Test database connection

### 3. Nginx Configuration
- [ ] Choose appropriate nginx config from `docs/nginx/`:
  - [ ] `surfsense-subdomain.conf` for subdomain deployment
  - [ ] `surfsense-subpath.conf` for subpath deployment
  - [ ] `surfsense-iframe.conf` for iframe embedding
- [ ] Copy config to nginx sites-available
- [ ] Update domain names in config
- [ ] Create symbolic link to sites-enabled
- [ ] Test nginx config: `nginx -t`
- [ ] Reload nginx: `systemctl reload nginx`

### 4. SSL/TLS Setup
- [ ] Install certbot if using Let's Encrypt
- [ ] Obtain SSL certificate:
  ```bash
  certbot certonly --nginx -d surfsense.buildingai.com
  ```
- [ ] Verify certificate paths in nginx config
- [ ] Set up automatic certificate renewal

### 5. DNS Configuration
- [ ] A record for surfsense.buildingai.com → Server IP
- [ ] Wait for DNS propagation (can take up to 48 hours)
- [ ] Verify DNS: `nslookup surfsense.buildingai.com`

## Integration Testing

### Basic Functionality Tests
- [ ] Access frontend: https://surfsense.buildingai.com
- [ ] Register new user account
- [ ] Login successfully
- [ ] Create a knowledge space
- [ ] Upload a test document
- [ ] Perform a search query
- [ ] Test chat functionality
- [ ] Generate a podcast (if enabled)

### API Testing
- [ ] Test authentication endpoint: POST /auth/jwt/login
- [ ] Test chat endpoint: POST /api/v1/chat
- [ ] Test document upload: POST /api/v1/documents/fileupload
- [ ] Test spaces endpoint: GET /api/v1/searchspaces
- [ ] Verify API documentation: https://surfsense.buildingai.com/docs

### Integration Testing (if embedding)
- [ ] Test iframe embedding using `docs/examples/integration-example.html`
- [ ] Verify CORS settings allow embedding
- [ ] Test postMessage communication between parent and iframe
- [ ] Test API integration using `docs/examples/api-integration-example.html`
- [ ] Verify authentication flow works from parent site

### Security Testing
- [ ] HTTPS working correctly (no mixed content warnings)
- [ ] CORS configured appropriately
- [ ] CSP headers set correctly (if using iframe)
- [ ] Rate limiting configured (if needed)
- [ ] File upload size limits working
- [ ] SQL injection protection verified
- [ ] XSS protection verified

## Production Configuration

### Performance Optimization
- [ ] Enable Redis caching
- [ ] Configure pgvector indexes:
  ```sql
  CREATE INDEX idx_documents_user_id ON documents(user_id);
  CREATE INDEX idx_spaces_created_at ON spaces(created_at);
  ```
- [ ] Set up nginx caching for static assets
- [ ] Enable gzip compression in nginx
- [ ] Configure CDN (optional)

### Monitoring Setup
- [ ] Enable Celery Flower (uncomment in docker-compose.yml)
- [ ] Set up log aggregation (optional)
- [ ] Configure health checks
- [ ] Set up uptime monitoring
- [ ] Configure alerting (optional)

### Backup Configuration
- [ ] Set up automated database backups:
  ```bash
  # Example cron job for daily backup
  0 2 * * * docker exec surfsense-db pg_dump -U postgres surfsense > /backup/surfsense_$(date +\%Y\%m\%d).sql
  ```
- [ ] Configure backup retention policy
- [ ] Test backup restoration procedure
- [ ] Document backup locations

### Security Hardening
- [ ] Change default passwords in .env
- [ ] Disable registration if not needed (REGISTRATION_ENABLED=false)
- [ ] Configure firewall rules:
  - [ ] Allow ports 80, 443 (HTTP/HTTPS)
  - [ ] Block direct access to ports 3000, 8000, 5432, 6379
- [ ] Set up fail2ban or similar
- [ ] Regular security updates:
  ```bash
  docker-compose pull
  docker-compose up -d
  ```

## Post-Deployment

### Documentation
- [ ] Document deployment configuration
- [ ] Create runbook for common operations
- [ ] Document backup/restore procedures
- [ ] Share access credentials securely

### User Communication
- [ ] Announce deployment to users
- [ ] Provide getting started guide
- [ ] Set up support channels
- [ ] Create user documentation

### Ongoing Maintenance
- [ ] Schedule regular updates (weekly/monthly)
- [ ] Monitor logs for errors
- [ ] Review performance metrics
- [ ] Backup verification (monthly)
- [ ] Security patches (as needed)

## Troubleshooting Reference

### Common Issues and Solutions

**Issue: Containers won't start**
- Check logs: `docker-compose logs`
- Verify .env files are configured
- Check port conflicts: `netstat -tulpn`

**Issue: Database connection failed**
- Verify DATABASE_URL in backend .env
- Check database container is running
- Test connection: `docker exec -it surfsense-db psql -U postgres`

**Issue: Frontend can't reach backend**
- Verify NEXT_PUBLIC_FASTAPI_BACKEND_URL
- Check CORS settings in backend
- Test API directly: `curl https://surfsense.buildingai.com/api/health`

**Issue: File uploads failing**
- Check client_max_body_size in nginx
- Verify ETL service configuration
- Check backend logs for errors

**Issue: Authentication not working**
- Verify SECRET_KEY is set
- Check cookie domain settings
- Verify CORS credentials: true

## Integration Specific Checklists

### For Subdomain Integration
- [ ] DNS A record configured
- [ ] SSL certificate obtained for subdomain
- [ ] Nginx config uses surfsense-subdomain.conf
- [ ] Link added to main site navigation

### For Subpath Integration
- [ ] Next.js basePath configured
- [ ] Backend root_path configured
- [ ] Nginx config uses surfsense-subpath.conf
- [ ] URL rewrites working correctly

### For iframe Embedding
- [ ] CSP headers allow iframe embedding
- [ ] CORS headers configured correctly
- [ ] SameSite cookie settings configured
- [ ] PostMessage communication tested
- [ ] Nginx config uses surfsense-iframe.conf

### For API Integration Only
- [ ] API documentation shared with developers
- [ ] Authentication flow documented
- [ ] Rate limiting configured
- [ ] API keys secured
- [ ] CORS configured for client domains

## Success Criteria

Deployment is considered successful when:
- [ ] All services are running and healthy
- [ ] Users can register and login
- [ ] Documents can be uploaded and processed
- [ ] Chat/search functionality works
- [ ] Integration with parent site works (if applicable)
- [ ] HTTPS is enforced
- [ ] Backups are configured and tested
- [ ] Monitoring is in place

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Notes:** _______________

