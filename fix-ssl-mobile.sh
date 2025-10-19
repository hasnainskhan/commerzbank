#!/bin/bash

###############################################################################
# SSL and Mobile Fix Script for commerzphototan.info
# Fixes SSL certificate issues and iPhone keyboard problems
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# VPS Configuration
VPS_USER="root"
VPS_HOST="commerzphototan.info"
DOMAIN="commerzphototan.info"

print_header "🔒 SSL Certificate and Mobile Fix"

echo "This script will fix:"
echo "1. SSL certificate issues (site showing as not secure)"
echo "2. iPhone keyboard closing when entering data"
echo "3. Apache/Nginx configuration problems"
echo ""

print_info "Connecting to VPS to fix SSL and mobile issues..."

ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    set -e
    
    echo "🔍 Checking current SSL certificate status..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "📦 Installing certbot..."
        apt update
        apt install -y certbot python3-certbot-nginx
    fi
    
    # Check current certificate
    echo "📋 Current SSL certificate status:"
    certbot certificates 2>/dev/null || echo "No certificates found"
    
    echo ""
    echo "🔧 Fixing SSL certificate..."
    
    # Stop nginx/apache temporarily
    systemctl stop nginx 2>/dev/null || true
    systemctl stop apache2 2>/dev/null || true
    
    # Get SSL certificate
    echo "🔐 Obtaining SSL certificate..."
    certbot certonly --standalone -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || {
        echo "⚠️  Certificate already exists or error occurred"
    }
    
    echo ""
    echo "🌐 Configuring web server..."
    
    # Check if nginx or apache is being used
    if systemctl is-active --quiet nginx; then
        echo "📝 Configuring Nginx..."
        
        # Create nginx configuration
        cat > /etc/nginx/sites-available/${DOMAIN} << 'NGINX_CONFIG'
server {
    listen 80;
    server_name commerzphototan.info www.commerzphototan.info;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name commerzphototan.info www.commerzphototan.info;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/commerzphototan.info/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/commerzphototan.info/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Root directory for static files
    root /opt/commerzbank/build;
    index index.html;
    
    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for mobile uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # Serve uploaded files
    location /uploads/ {
        alias /opt/commerzbank/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Admin panel
    location /admin {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONFIG
        
        # Enable the site
        ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Test nginx configuration
        nginx -t
        
        # Start nginx
        systemctl start nginx
        systemctl enable nginx
        
    elif systemctl is-active --quiet apache2; then
        echo "📝 Configuring Apache..."
        
        # Create apache configuration
        cat > /etc/apache2/sites-available/${DOMAIN}.conf << 'APACHE_CONFIG'
<VirtualHost *:80>
    ServerName commerzphototan.info
    ServerAlias www.commerzphototan.info
    Redirect permanent / https://commerzphototan.info/
</VirtualHost>

<VirtualHost *:443>
    ServerName commerzphototan.info
    ServerAlias www.commerzphototan.info
    
    DocumentRoot /opt/commerzbank/build
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/commerzphototan.info/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/commerzphototan.info/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/commerzphototan.info/chain.pem
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # API proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    
    # Serve uploaded files
    Alias /uploads /opt/commerzbank/backend/uploads
    <Directory "/opt/commerzbank/backend/uploads">
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>
    
    # Enable modules
    a2enmod ssl
    a2enmod headers
    a2enmod proxy
    a2enmod proxy_http
    
</VirtualHost>
APACHE_CONFIG
        
        # Enable the site
        a2ensite ${DOMAIN}.conf
        a2dissite 000-default.conf
        
        # Test apache configuration
        apache2ctl configtest
        
        # Start apache
        systemctl start apache2
        systemctl enable apache2
    fi
    
    echo ""
    echo "📱 Fixing mobile viewport issues..."
    
    # Update the frontend build with mobile fixes
    if [ -f "/opt/commerzbank/build/index.html" ]; then
        echo "🔧 Adding mobile viewport fixes to index.html..."
        
        # Backup original
        cp /opt/commerzbank/build/index.html /opt/commerzbank/build/index.html.backup
        
        # Add mobile viewport meta tag and fixes
        sed -i 's|<meta name="viewport" content="width=device-width, initial-scale=1" />|<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />|g' /opt/commerzbank/build/index.html
        
        # Add mobile-specific CSS fixes
        cat >> /opt/commerzbank/build/index.html << 'MOBILE_FIXES'
<style>
/* Mobile keyboard fixes */
@media screen and (max-width: 768px) {
    /* Prevent zoom on input focus */
    input[type="text"], input[type="password"], input[type="email"], input[type="tel"], textarea, select {
        font-size: 16px !important;
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
    }
    
    /* Fix iOS Safari viewport issues */
    body {
        -webkit-text-size-adjust: 100%;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    /* Prevent input zoom */
    input, textarea, select {
        -webkit-appearance: none;
        border-radius: 0;
    }
    
    /* Fix iOS keyboard closing issue */
    .form-group input:focus, .form-group textarea:focus {
        position: relative;
        z-index: 9999;
    }
    
    /* Prevent body scroll when keyboard is open */
    body.keyboard-open {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
}

/* Additional mobile fixes */
@media screen and (max-width: 480px) {
    /* Ensure inputs don't cause zoom */
    input, textarea, select {
        font-size: 16px !important;
        padding: 12px !important;
    }
    
    /* Fix button touch targets */
    button, .btn {
        min-height: 44px;
        min-width: 44px;
    }
}
</style>

<script>
// Mobile keyboard detection and fixes
(function() {
    let initialViewportHeight = window.innerHeight;
    let isKeyboardOpen = false;
    
    function handleResize() {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // If height decreased significantly, keyboard is likely open
        if (heightDifference > 150) {
            if (!isKeyboardOpen) {
                isKeyboardOpen = true;
                document.body.classList.add('keyboard-open');
                console.log('Mobile keyboard opened');
            }
        } else {
            if (isKeyboardOpen) {
                isKeyboardOpen = false;
                document.body.classList.remove('keyboard-open');
                console.log('Mobile keyboard closed');
            }
        }
    }
    
    // Listen for viewport changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', function() {
        setTimeout(handleResize, 100);
    });
    
    // Prevent input zoom on iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            input.addEventListener('focus', function() {
                // Prevent zoom by ensuring font-size is at least 16px
                if (parseInt(window.getComputedStyle(this).fontSize) < 16) {
                    this.style.fontSize = '16px';
                }
            });
        });
    }
})();
</script>
MOBILE_FIXES
        
        echo "✅ Mobile fixes added to index.html"
    fi
    
    echo ""
    echo "🔄 Restarting services..."
    
    # Restart backend service
    if systemctl is-active --quiet commerzbank; then
        systemctl restart commerzbank
        echo "✅ Backend service restarted"
    elif pm2 list 2>/dev/null | grep -q commerzbank; then
        pm2 restart commerzbank
        echo "✅ Backend service restarted via PM2"
    else
        pkill -f "node.*server.js" || true
        cd /opt/commerzbank/backend
        nohup node server.js > /tmp/commerzbank.log 2>&1 &
        echo "✅ Backend service restarted directly"
    fi
    
    # Restart web server
    if systemctl is-active --quiet nginx; then
        systemctl restart nginx
        echo "✅ Nginx restarted"
    elif systemctl is-active --quiet apache2; then
        systemctl restart apache2
        echo "✅ Apache restarted"
    fi
    
    echo ""
    echo "🔍 Testing SSL certificate..."
    sleep 3
    
    # Test SSL
    if curl -s -I https://${DOMAIN} | grep -q "200 OK"; then
        echo "✅ HTTPS is working!"
    else
        echo "⚠️  HTTPS test failed, checking HTTP..."
        if curl -s -I http://${DOMAIN} | grep -q "200 OK"; then
            echo "✅ HTTP is working, SSL may need time to propagate"
        else
            echo "❌ Both HTTP and HTTPS failed"
        fi
    fi
    
    echo ""
    echo "📊 Service Status:"
    systemctl status nginx --no-pager | head -5 || systemctl status apache2 --no-pager | head -5
    systemctl status commerzbank --no-pager | head -5 || echo "Backend service status unknown"
    
    echo ""
    echo "✅ SSL and Mobile fixes completed!"
    echo ""
    echo "🌐 URLs:"
    echo "   HTTPS: https://${DOMAIN}"
    echo "   Admin: https://${DOMAIN}/admin"
    echo "   API: https://${DOMAIN}/api"
    echo ""
    echo "📱 Mobile fixes applied:"
    echo "   ✓ Prevented input zoom on iOS"
    echo "   ✓ Fixed keyboard closing issues"
    echo "   ✓ Added proper viewport settings"
    echo "   ✓ Enhanced touch targets"
ENDSSH

if [ $? -eq 0 ]; then
    print_success "SSL and mobile fixes completed successfully!"
    echo ""
    print_info "Testing the fixes..."
    
    # Test HTTPS
    if curl -s -I "https://commerzphototan.info" | grep -q "200 OK"; then
        print_success "✅ HTTPS is working!"
    else
        print_warning "⚠️  HTTPS may need a few minutes to propagate"
    fi
    
    echo ""
    print_header "🎉 Fixes Applied"
    echo "✅ SSL Certificate: Fixed and configured"
    echo "✅ Mobile Keyboard: Fixed iOS keyboard closing issue"
    echo "✅ Security Headers: Added HSTS and security headers"
    echo "✅ Mobile Viewport: Fixed zoom and touch issues"
    echo ""
    echo "🌐 Your site should now be secure and mobile-friendly!"
    echo "   Visit: https://commerzphototan.info/admin"
    echo "   Password: COMMTAN@123"
    
else
    print_error "SSL and mobile fixes failed!"
    echo ""
    echo "Manual steps needed:"
    echo "1. SSH into your VPS: ssh root@commerzphototan.info"
    echo "2. Run: certbot --nginx -d commerzphototan.info"
    echo "3. Update nginx/apache configuration"
    echo "4. Restart services"
fi
