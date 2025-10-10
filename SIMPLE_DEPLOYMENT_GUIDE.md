# 🚀 Simple Deployment Guide - Commerzbank Application

## Quick Start Deployment on Ubuntu Server

This guide will help you deploy the Commerzbank application on an Ubuntu server in just a few steps.

### 📋 Prerequisites

- **Ubuntu Server** (20.04 LTS or newer)
- **Root or sudo access**
- **Domain name** (optional, for SSL)
- **Minimum 2GB RAM**
- **Minimum 20GB free disk space**

---

## 🎯 Method 1: Automated Deployment (Recommended)

### Step 1: Upload Your Application
```bash
# Upload your application files to the server
# You can use SCP, SFTP, or Git clone
scp -r /path/to/commerzbank user@your-server:/home/user/
```

### Step 2: Run the Deployment Script
```bash
# SSH into your server
ssh user@your-server

# Navigate to the application directory
cd /home/user/commerzbank

# Make the deployment script executable
chmod +x deploy-amd.sh

# Run the automated deployment
./deploy-amd.sh
```

**That's it!** The script will automatically:
- ✅ Install all dependencies (Node.js, PostgreSQL, Nginx)
- ✅ Setup the database
- ✅ Configure the application
- ✅ Setup Nginx reverse proxy
- ✅ Configure firewall and security
- ✅ Start all services

---

## 🛠️ Method 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

### Step 1: Install System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw
```

### Step 2: Install Node.js
```bash
# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Setup PostgreSQL Database
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE commcomm_db;"
sudo -u postgres psql -c "CREATE USER commcomm_user WITH ENCRYPTED PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE commcomm_db TO commcomm_user;"
```

### Step 4: Setup Application
```bash
# Create application directory
sudo mkdir -p /opt/commcomm
sudo chown $USER:$USER /opt/commcomm

# Copy application files
cp -r /home/user/commerzbank/* /opt/commcomm/
cd /opt/commcomm

# Install dependencies
cd backend && npm install --production
cd .. && npm install --production && npm run build
```

### Step 5: Configure Environment
```bash
# Create production .env file
cat > backend/.env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://commcomm_user:your_secure_password@localhost:5432/commcomm_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
SESSION_SECRET="your-super-secret-session-key-change-this"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_admin_password"
EOF

# Set proper permissions
chmod 600 backend/.env
```

### Step 6: Setup Database
```bash
cd /opt/commcomm/backend
npx prisma generate
npx prisma db push
```

### Step 7: Create System Service
```bash
# Create systemd service
sudo tee /etc/systemd/system/commcomm.service > /dev/null << EOF
[Unit]
Description=Commerzbank Application
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

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable commcomm
sudo systemctl start commcomm
```

### Step 8: Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/commcomm > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        root /opt/commcomm/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # File uploads
    location /uploads/ {
        alias /opt/commcomm/backend/uploads/;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/commcomm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Setup Firewall
```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3001/tcp
```

---

## 🔧 Post-Deployment Configuration

### 1. Update Domain Name
```bash
# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/commcomm
# Change 'your-domain.com' to your actual domain
sudo nginx -t && sudo systemctl reload nginx
```

### 2. Setup SSL Certificate (Optional)
```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Update Admin Credentials
```bash
# Edit environment file
sudo nano /opt/commcomm/backend/.env
# Change ADMIN_USERNAME and ADMIN_PASSWORD
sudo systemctl restart commcomm
```

---

## ✅ Verify Deployment

### Check Service Status
```bash
sudo systemctl status commcomm postgresql nginx
```

### Test Application
```bash
# Test backend API
curl http://localhost:3001/api/health

# Test frontend (if domain is configured)
curl http://your-domain.com
```

### View Logs
```bash
# Application logs
sudo journalctl -u commcomm -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🌐 Access Your Application

- **Main Application**: `http://your-domain.com` or `http://your-server-ip`
- **Admin Panel**: `http://your-domain.com/admin`
- **Default Admin Login**: 
  - Username: `admin`
  - Password: `admin123` (change this!)

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET and SESSION_SECRET
- [ ] Setup SSL certificate
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Monitor logs

---

## 🆘 Troubleshooting

### Application Not Starting
```bash
# Check logs
sudo journalctl -u commcomm -f

# Check database connection
sudo -u postgres psql -c "SELECT 1;"
```

### Nginx Errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U commcomm_user -d commcomm_db
```

---

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify all services are running
3. Check network connectivity
4. Review configuration files
5. Consult the troubleshooting section

---

## 🎉 Success!

Your Commerzbank application is now deployed and running on your Ubuntu server!

**Next Steps:**
- Configure your domain name
- Setup SSL certificate
- Change default passwords
- Monitor the application
- Setup regular backups

---

*This guide provides a simple way to deploy the Commerzbank application. For more advanced configurations, refer to the detailed DEPLOYMENT.md file.*
