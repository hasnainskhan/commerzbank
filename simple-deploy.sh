#!/bin/bash

# Simple Deployment Script for Commerzbank Application
# This script provides an easy way to deploy the application on Ubuntu

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
    exit 1
fi

# Check if sudo is available
if ! command -v sudo &> /dev/null; then
    print_error "sudo is required but not installed. Please install sudo first."
    exit 1
fi

print_header "🚀 Simple Deployment for Commerzbank Application"

# Get user input
echo -e "${YELLOW}Please provide the following information:${NC}"
read -p "Enter your domain name (or press Enter to use IP): " DOMAIN_NAME
read -p "Enter admin username (default: admin): " ADMIN_USER
read -p "Enter admin password: " ADMIN_PASS
read -p "Enter database password: " DB_PASS

# Set defaults
ADMIN_USER=${ADMIN_USER:-admin}
DOMAIN_NAME=${DOMAIN_NAME:-localhost}

if [[ -z "$ADMIN_PASS" ]]; then
    print_error "Admin password is required!"
    exit 1
fi

if [[ -z "$DB_PASS" ]]; then
    print_error "Database password is required!"
    exit 1
fi

print_header "Installing System Dependencies"

# Update system
print_status "Updating system packages..."
sudo apt update

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

print_header "Installing Node.js"

# Install Node.js LTS
print_status "Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

print_header "Setting up PostgreSQL"

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
print_status "Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE commcomm_db;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS commcomm_user;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER commcomm_user WITH ENCRYPTED PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE commcomm_db TO commcomm_user;"
sudo -u postgres psql -c "ALTER USER commcomm_user CREATEDB;"

print_header "Setting up Application"

# Create application directory
APP_DIR="/opt/commcomm"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install --production

# Install frontend dependencies and build
print_status "Installing frontend dependencies and building..."
cd ..
npm install --production
npm run build

print_header "Configuring Environment"

# Create production .env file
print_status "Creating production environment configuration..."
cat > backend/.env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://commcomm_user:$DB_PASS@localhost:5432/commcomm_db?schema=public"

# Security
JWT_SECRET="$(openssl rand -base64 32)"
SESSION_SECRET="$(openssl rand -base64 32)"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Admin Panel
ADMIN_USERNAME="$ADMIN_USER"
ADMIN_PASSWORD="$ADMIN_PASS"
EOF

# Set proper permissions
chmod 600 backend/.env

print_header "Setting up Database"

# Generate Prisma client and push schema
cd backend
print_status "Generating Prisma client..."
npx prisma generate

print_status "Pushing database schema..."
npx prisma db push

print_header "Creating System Service"

# Create systemd service file
sudo tee /etc/systemd/system/commcomm.service > /dev/null << EOF
[Unit]
Description=Commerzbank Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/backend
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

print_header "Configuring Nginx"

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/commcomm > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Frontend
    location / {
        root $APP_DIR/build;
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
        alias $APP_DIR/backend/uploads/;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/commcomm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

print_header "Configuring Firewall"

# Configure firewall
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3001/tcp

print_header "Starting Services"

# Start all services
sudo systemctl start commcomm
sudo systemctl restart nginx

print_status "All services started successfully"

print_header "Verifying Deployment"

# Wait for services to start
sleep 5

# Check service status
print_status "Checking service status..."
sudo systemctl status commcomm --no-pager -l | head -10
sudo systemctl status nginx --no-pager -l | head -5

# Test application
print_status "Testing application..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status "✅ Backend API is responding"
else
    print_warning "⚠️ Backend API is not responding yet"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    print_status "✅ Frontend is accessible"
else
    print_warning "⚠️ Frontend is not accessible yet"
fi

print_header "🎉 Deployment Completed Successfully!"

echo -e "${GREEN}Your application is now deployed!${NC}"
echo ""
echo -e "${YELLOW}Access Information:${NC}"
if [[ "$DOMAIN_NAME" == "localhost" ]]; then
    echo "• Main Application: http://$(curl -s ifconfig.me)"
    echo "• Admin Panel: http://$(curl -s ifconfig.me)/admin"
else
    echo "• Main Application: http://$DOMAIN_NAME"
    echo "• Admin Panel: http://$DOMAIN_NAME/admin"
fi
echo "• Admin Username: $ADMIN_USER"
echo "• Admin Password: $ADMIN_PASS"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
if [[ "$DOMAIN_NAME" != "localhost" ]]; then
    echo "1. Setup SSL certificate: sudo certbot --nginx -d $DOMAIN_NAME"
fi
echo "2. Monitor logs: sudo journalctl -u commcomm -f"
echo "3. Check status: sudo systemctl status commcomm postgresql nginx"
echo ""

echo -e "${YELLOW}Important Security Notes:${NC}"
echo "• Change default passwords in production"
echo "• Setup regular backups"
echo "• Monitor system resources and logs"
echo "• Keep system updated"
echo ""

print_status "Deployment completed successfully! 🚀"
