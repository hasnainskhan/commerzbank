# AMD Deployment Guide for Commcomm Application

## Overview
This guide provides step-by-step instructions for deploying the Commcomm application on AMD-based systems (Ubuntu 22.04 LTS).

## Prerequisites
- Ubuntu 22.04 LTS (or compatible AMD64 system)
- Root or sudo access
- Domain name (for SSL setup)
- Minimum 2GB RAM
- Minimum 20GB free disk space

## Quick Deployment

### 1. Run the Deployment Script
```bash
# Make the script executable (if not already)
chmod +x deploy-amd.sh

# Run the deployment script
./deploy-amd.sh
```

The script will automatically:
- ✅ Check system architecture
- ✅ Install all dependencies
- ✅ Setup PostgreSQL database
- ✅ Install Node.js LTS
- ✅ Configure the application
- ✅ Setup Nginx reverse proxy
- ✅ Configure SSL (with Let's Encrypt)
- ✅ Setup firewall and security
- ✅ Start all services

### 2. Post-Deployment Configuration

#### Update Domain Name
Edit the Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/commcomm
```
Change `your-domain.com` to your actual domain.

#### Setup SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Update Admin Credentials
```bash
sudo nano /opt/commcomm/backend/.env
```
Change the default admin username and password.

## Manual Deployment Steps

If you prefer to run the deployment manually:

### 1. System Dependencies
```bash
sudo apt update
sudo apt install -y curl wget git build-essential libssl-dev libreadline-dev zlib1g-dev libbz2-dev libsqlite3-dev libpq-dev postgresql-client nginx certbot python3-certbot-nginx ufw fail2ban
```

### 2. PostgreSQL Setup
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE commcomm_db;"
sudo -u postgres psql -c "CREATE USER commcomm_user WITH ENCRYPTED PASSWORD 'secure_password_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE commcomm_db TO commcomm_user;"
```

### 3. Node.js Installation
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. Application Setup
```bash
# Create application directory
sudo mkdir -p /opt/commcomm
sudo chown $USER:$USER /opt/commcomm

# Copy application files
cp -r . /opt/commcomm/
cd /opt/commcomm

# Install dependencies
cd backend && npm install --production
cd ../src && npm install --production && npm run build
```

### 5. Environment Configuration
```bash
# Create production .env file
cat > backend/.env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://commcomm_user:secure_password_123@localhost:5432/commcomm_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
EOF
```

### 6. Database Setup
```bash
cd /opt/commcomm/backend
npx prisma generate
npx prisma db push
```

### 7. Systemd Service
```bash
sudo tee /etc/systemd/system/commcomm.service > /dev/null << EOF
[Unit]
Description=Commcomm Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/commcomm/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable commcomm.service
sudo systemctl start commcomm.service
```

### 8. Nginx Configuration
```bash
sudo tee /etc/nginx/sites-available/commcomm > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        root /opt/commcomm/src/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /uploads/ {
        alias /opt/commcomm/backend/uploads/;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/commcomm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Service Management

### Check Service Status
```bash
sudo systemctl status commcomm postgresql nginx
```

### View Application Logs
```bash
sudo journalctl -u commcomm -f
```

### Restart Services
```bash
sudo systemctl restart commcomm
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

## Security Configuration

### Firewall Setup
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3001/tcp
```

### SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Monitoring and Maintenance

### Log Rotation
Logs are automatically rotated daily. Check configuration:
```bash
sudo cat /etc/logrotate.d/commcomm
```

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U commcomm_user commcomm_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -h localhost -U commcomm_user commcomm_db < backup_20240101.sql
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check network connections
sudo netstat -tlnp | grep -E ':(80|443|3001|5432)'
```

## Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check logs
sudo journalctl -u commcomm -f

# Check database connection
sudo -u postgres psql -c "SELECT 1;"

# Verify environment variables
cat /opt/commcomm/backend/.env
```

#### Nginx Errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check access logs
sudo tail -f /var/log/nginx/access.log
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U commcomm_user -d commcomm_db

# Check database exists
sudo -u postgres psql -c "\l"
```

#### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/commcomm

# Fix permissions
chmod -R 755 /opt/commcomm
chmod 600 /opt/commcomm/backend/.env
```

## Performance Optimization

### Nginx Optimization
- Enable gzip compression
- Configure caching headers
- Use HTTP/2
- Enable SSL session caching

### Database Optimization
- Regular VACUUM and ANALYZE
- Monitor slow queries
- Configure connection pooling
- Set appropriate memory settings

### Application Optimization
- Use PM2 for process management
- Enable clustering
- Monitor memory usage
- Implement proper error handling

## Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# Create daily backup script
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -h localhost -U commcomm_user commcomm_db > $BACKUP_DIR/db_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/commcomm

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## Support

For issues and support:
1. Check the logs first
2. Verify all services are running
3. Check network connectivity
4. Review configuration files
5. Consult the troubleshooting section

## Security Checklist

- [ ] Change default passwords
- [ ] Update JWT and session secrets
- [ ] Configure SSL certificates
- [ ] Enable firewall
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup strategy in place
- [ ] Access controls configured
- [ ] File permissions set correctly

---

**Note**: This deployment guide is optimized for AMD64 architecture and Ubuntu 22.04 LTS. Adjustments may be needed for other systems.
