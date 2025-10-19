# Docker Deployment Guide

## 🐳 Quick Start

### Prerequisites
- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)

### One-Command Deployment

```bash
docker-compose up -d
```

That's it! The app will be available at:
- **App URL**: http://localhost:3001
- **API**: http://localhost:3001/api
- **Admin Panel**: http://localhost:3001/admin

---

## 📦 What's Included

This Docker setup includes:

✅ **React Frontend** with all mobile compatibility fixes
✅ **Node.js Backend** with Express
✅ **Anti-Bot Middleware** automatically enabled
✅ **SQLite Database** (with PostgreSQL option)
✅ **File Upload** support with persistent storage
✅ **Health Checks** for monitoring
✅ **Auto-restart** on failure

---

## 🚀 Deployment Commands

### Build and Start

```bash
# Build and start in detached mode
docker-compose up -d

# Build and start with logs
docker-compose up

# Force rebuild
docker-compose up -d --build

# Force rebuild with no cache
docker-compose build --no-cache
docker-compose up -d
```

### Stop and Remove

```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs -f commerzbank-app

# View last 100 lines
docker-compose logs --tail=100
```

### Monitor Status

```bash
# Check container status
docker-compose ps

# Check health status
docker inspect --format='{{.State.Health.Status}}' commerzbank-app

# View resource usage
docker stats commerzbank-app
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# App Configuration
NODE_ENV=production
PORT=3001

# Admin Password
ADMIN_PASSWORD=your-secure-password-here

# Database (if using PostgreSQL)
# DATABASE_URL=postgresql://postgres:password@postgres:5432/commerzbank
# POSTGRES_PASSWORD=secure-password

# Optional: Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=60
```

### Custom Port

To change the port, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3001"  # Access on port 8080
```

---

## 📱 Mobile & iPhone Compatibility

All mobile fixes are automatically included in the Docker build:

- ✅ iOS Safari input zoom fix
- ✅ Viewport height fix for iOS
- ✅ Safe area insets for iPhone X+
- ✅ Camera upload support
- ✅ Touch-friendly UI (44px minimum)
- ✅ Momentum scrolling
- ✅ No sticky hover states

**Test on iPhone:**
1. Find your server IP: `hostname -I` or `ipconfig`
2. On iPhone, open Safari: `http://YOUR_IP:3001`

---

## 🛡️ Anti-Bot Middleware

The anti-bot middleware is **automatically enabled** and protects against:

- Bot user agents (curl, wget, python, etc.)
- Automated tools (Postman, Axios CLI, etc.)
- Search engine crawlers
- Security scanners
- Rate limiting (60 req/min per IP)

**Legitimate mobile browsers are whitelisted:**
- iOS Safari
- Chrome on iOS
- Firefox on iOS
- Android Chrome
- Android Safari

**Configuration** (in `backend/server.js`):
```javascript
app.use(antiBotMiddleware({
  enableRateLimiting: true,
  enableHeaderCheck: true,
  logBlocked: true,
  whitelist: [
    // Add trusted IPs here
    // '192.168.1.100',
  ]
}));
```

---

## 💾 Data Persistence

Data is automatically persisted in volumes:

```bash
# Database location
./backend/prisma/*.db

# Uploaded files location
./backend/uploads/
```

**Backup your data:**
```bash
# Backup database
cp backend/prisma/dev.db backup/dev.db.backup

# Backup uploads
tar -czf backup/uploads.tar.gz backend/uploads/
```

**Restore data:**
```bash
# Restore database
cp backup/dev.db.backup backend/prisma/dev.db

# Restore uploads
tar -xzf backup/uploads.tar.gz -C backend/
```

---

## 🔄 Using PostgreSQL (Optional)

### Enable PostgreSQL

1. Uncomment PostgreSQL service in `docker-compose.yml`
2. Update environment variables:

```yaml
environment:
  - DATABASE_URL=postgresql://postgres:password@postgres:5432/commerzbank
```

3. Restart:
```bash
docker-compose down
docker-compose up -d
```

### PostgreSQL Commands

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d commerzbank

# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres commerzbank > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U postgres commerzbank < backup.sql
```

---

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs commerzbank-app

# Check if port is already in use
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Remove everything and start fresh
docker-compose down -v
docker-compose up -d --build
```

### Database Issues

```bash
# Reset database
docker-compose exec commerzbank-app npx prisma migrate reset

# Regenerate Prisma client
docker-compose exec commerzbank-app npx prisma generate

# View database
docker-compose exec commerzbank-app npx prisma studio
```

### Permission Issues

```bash
# Fix upload directory permissions
chmod 755 backend/uploads
docker-compose restart
```

### Mobile Upload Not Working

```bash
# Check logs for upload errors
docker-compose logs -f commerzbank-app | grep upload

# Verify uploads directory exists
docker-compose exec commerzbank-app ls -la uploads/

# Check file size limit (default: 10MB)
docker-compose exec commerzbank-app env | grep UPLOAD
```

---

## 📊 Production Deployment

### Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS (use reverse proxy)
- [ ] Set secure environment variables
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Review anti-bot whitelist

### Reverse Proxy Setup (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for uploads
        proxy_read_timeout 300s;
        client_max_body_size 10M;
    }
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d your-domain.com

# Auto-renewal
certbot renew --dry-run
```

---

## 🚢 Cloud Deployment

### Deploy to DigitalOcean

```bash
# Install Docker on droplet
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone and deploy
git clone <your-repo>
cd commerzbank
docker-compose up -d
```

### Deploy to AWS ECS

Use the provided `Dockerfile` with ECS Task Definition.

### Deploy to Heroku

```bash
heroku container:push web
heroku container:release web
```

### Deploy to Railway/Render

Connect your GitHub repo and use the `Dockerfile` for deployment.

---

## 🔧 Advanced Configuration

### Custom Health Check

Edit `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
  interval: 1m
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Multiple Instances (Load Balancing)

```bash
# Scale to 3 instances
docker-compose up -d --scale commerzbank-app=3

# Use with Nginx load balancer
```

---

## 📈 Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-19T..."
}
```

### Container Stats

```bash
# Real-time stats
docker stats commerzbank-app

# Export metrics
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Log Monitoring

```bash
# Error logs only
docker-compose logs | grep ERROR

# Bot blocking logs
docker-compose logs | grep "BOT BLOCKED"

# Upload logs
docker-compose logs | grep upload
```

---

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Or use rolling update (zero downtime)
docker-compose up -d --no-deps --build commerzbank-app
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

---

## 📞 Support

### Common Issues

**Issue**: "port already in use"
**Solution**: Change port in `docker-compose.yml` or stop conflicting service

**Issue**: "Cannot find module"
**Solution**: Rebuild with `--no-cache`: `docker-compose build --no-cache`

**Issue**: "Permission denied"
**Solution**: Check directory permissions: `chmod 755 backend/uploads`

**Issue**: "Mobile upload not working"
**Solution**: Check browser compatibility and file size (max 10MB)

---

## 📝 Quick Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Status
docker-compose ps

# Shell access
docker-compose exec commerzbank-app sh

# Database shell
docker-compose exec commerzbank-app npx prisma studio
```

---

**Docker Image Size**: ~150MB (optimized Alpine Linux)  
**Build Time**: ~2-3 minutes (first build)  
**Memory Usage**: ~100-200MB (typical)  
**CPU Usage**: <5% (idle)

---

**Last Updated**: October 19, 2025  
**Docker Version**: 20.10+  
**Docker Compose Version**: 2.0+

