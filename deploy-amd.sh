#!/bin/bash

# AMD Deployment Setup Script for Commcomm Application
# This script sets up the application for deployment on AMD-based systems

set -e  # Exit on any error

echo "🚀 Starting AMD Deployment Setup for Commcomm Application..."

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

# Check if running on AMD architecture
check_architecture() {
    print_header "Checking System Architecture"
    
    if [[ $(uname -m) == "x86_64" ]]; then
        print_status "System architecture: x86_64 (AMD64 compatible)"
    else
        print_warning "System architecture: $(uname -m) - This script is optimized for AMD64"
    fi
    
    # Check CPU info
    if command -v lscpu &> /dev/null; then
        CPU_VENDOR=$(lscpu | grep "Vendor ID" | awk '{print $3}')
        if [[ $CPU_VENDOR == "AuthenticAMD" ]]; then
            print_status "AMD CPU detected: $(lscpu | grep "Model name" | cut -d: -f2 | xargs)"
        else
            print_warning "CPU Vendor: $CPU_VENDOR (Not AMD, but compatible)"
        fi
    fi
}

# Install system dependencies
install_dependencies() {
    print_header "Installing System Dependencies"
    
    # Update package list
    print_status "Updating package list..."
    sudo apt update
    
    # Install essential packages
    print_status "Installing essential packages..."
    sudo apt install -y \
        curl \
        wget \
        git \
        build-essential \
        libssl-dev \
        libreadline-dev \
        zlib1g-dev \
        libbz2-dev \
        libsqlite3-dev \
        libpq-dev \
        postgresql-client \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        unzip
    
    print_status "System dependencies installed successfully"
}

# Setup PostgreSQL
setup_postgresql() {
    print_header "Setting up PostgreSQL"
    
    # Install PostgreSQL
    print_status "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    print_status "Creating database and user..."
    sudo -u postgres psql -c "CREATE DATABASE commcomm_db;"
    sudo -u postgres psql -c "CREATE USER commcomm_user WITH ENCRYPTED PASSWORD 'secure_password_123';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE commcomm_db TO commcomm_user;"
    sudo -u postgres psql -c "ALTER USER commcomm_user CREATEDB;"
    
    print_status "PostgreSQL setup completed"
}

# Install Node.js (LTS version)
install_nodejs() {
    print_header "Installing Node.js"
    
    # Install Node.js using NodeSource repository
    print_status "Installing Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_status "Node.js version: $NODE_VERSION"
    print_status "NPM version: $NPM_VERSION"
}

# Setup application
setup_application() {
    print_header "Setting up Application"
    
    # Create application directory
    APP_DIR="/opt/commcomm"
    print_status "Creating application directory: $APP_DIR"
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Copy application files
    print_status "Copying application files..."
    cp -r /home/chota/Desktop/Commcomm-main/* $APP_DIR/
    cd $APP_DIR
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install --production
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd ../src
    npm install --production
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    cd $APP_DIR
}

# Configure environment
configure_environment() {
    print_header "Configuring Environment"
    
    # Create production .env file
    print_status "Creating production environment configuration..."
    cat > backend/.env << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://commcomm_user:secure_password_123@localhost:5432/commcomm_db?schema=public"

# Security
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Admin Panel
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
EOF
    
    # Set proper permissions
    chmod 600 backend/.env
    print_status "Environment configuration completed"
}

# Setup database
setup_database() {
    print_header "Setting up Database"
    
    cd /opt/commcomm/backend
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Push database schema
    print_status "Pushing database schema..."
    npx prisma db push
    
    print_status "Database setup completed"
}

# Create systemd service
create_systemd_service() {
    print_header "Creating Systemd Service"
    
    # Create systemd service file
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
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=commcomm

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable commcomm.service
    
    print_status "Systemd service created and enabled"
}

# Configure Nginx
configure_nginx() {
    print_header "Configuring Nginx"
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/commcomm > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Change this to your domain
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Frontend (React app)
    location / {
        root /opt/commcomm/src/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
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
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File uploads
    location /uploads/ {
        alias /opt/commcomm/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Admin panel
    location /admin {
        root /opt/commcomm/src/build;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/commcomm /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_status "Nginx configured successfully"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_header "Setting up SSL Certificate"
    
    print_warning "SSL setup requires a domain name. Please update the domain in /etc/nginx/sites-available/commcomm first."
    print_warning "Then run: sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
    
    # Uncomment the following lines if you have a domain ready:
    # sudo certbot --nginx -d your-domain.com -d www.your-domain.com
    # sudo systemctl reload nginx
}

# Configure firewall
configure_firewall() {
    print_header "Configuring Firewall"
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Deny direct access to backend
    sudo ufw deny 3001/tcp
    
    print_status "Firewall configured successfully"
}

# Setup monitoring and logging
setup_monitoring() {
    print_header "Setting up Monitoring and Logging"
    
    # Install and configure fail2ban
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    # Create log rotation for application
    sudo tee /etc/logrotate.d/commcomm > /dev/null << EOF
/opt/commcomm/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload commcomm
    endscript
}
EOF
    
    print_status "Monitoring and logging configured"
}

# Start services
start_services() {
    print_header "Starting Services"
    
    # Start PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Start the application
    sudo systemctl start commcomm
    sudo systemctl enable commcomm
    
    # Start Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_status "All services started successfully"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check service status
    print_status "Checking service status..."
    sudo systemctl status postgresql --no-pager -l
    sudo systemctl status commcomm --no-pager -l
    sudo systemctl status nginx --no-pager -l
    
    # Check if application is responding
    print_status "Testing application endpoints..."
    sleep 5  # Wait for services to start
    
    if curl -f http://localhost:3001/api/admin/stats > /dev/null 2>&1; then
        print_status "✅ Backend API is responding"
    else
        print_error "❌ Backend API is not responding"
    fi
    
    if curl -f http://localhost > /dev/null 2>&1; then
        print_status "✅ Frontend is accessible"
    else
        print_error "❌ Frontend is not accessible"
    fi
    
    print_status "Deployment verification completed"
}

# Main execution
main() {
    print_header "AMD Deployment Setup for Commcomm Application"
    
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
    
    # Run setup steps
    check_architecture
    install_dependencies
    setup_postgresql
    install_nodejs
    setup_application
    configure_environment
    setup_database
    create_systemd_service
    configure_nginx
    configure_firewall
    setup_monitoring
    start_services
    verify_deployment
    
    print_header "🎉 Deployment Setup Completed Successfully!"
    
    echo -e "${GREEN}Next Steps:${NC}"
    echo "1. Update the domain name in /etc/nginx/sites-available/commcomm"
    echo "2. Run SSL setup: sudo certbot --nginx -d your-domain.com"
    echo "3. Update admin credentials in /opt/commcomm/backend/.env"
    echo "4. Monitor logs: sudo journalctl -u commcomm -f"
    echo "5. Access your application at: http://your-domain.com"
    echo "6. Admin panel: http://your-domain.com/admin"
    
    echo -e "\n${YELLOW}Important Security Notes:${NC}"
    echo "- Change default passwords in .env file"
    echo "- Update JWT_SECRET and SESSION_SECRET"
    echo "- Configure proper backup strategy"
    echo "- Monitor system resources and logs"
    
    print_status "Deployment setup completed successfully! 🚀"
}

# Run main function
main "$@"
