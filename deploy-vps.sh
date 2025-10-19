#!/bin/bash

###############################################################################
# VPS Deployment Script - Deploy to commerzphototan.info
# Pulls latest changes from git and restarts the backend service
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# VPS Configuration (Update these with your VPS details)
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-commerzphototan.info}"
VPS_PORT="${VPS_PORT:-22}"
APP_DIR="${APP_DIR:-/opt/commerzbank}"
SERVICE_NAME="${SERVICE_NAME:-commerzbank}"

print_header "🚀 VPS Deployment to ${VPS_HOST}"

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    print_warning "No SSH key found. You'll need to enter your password."
fi

print_info "Deploying to: ${VPS_USER}@${VPS_HOST}:${VPS_PORT}"
print_info "Application directory: ${APP_DIR}"
echo ""

# Deploy to VPS
print_header "Deploying to VPS"

print_info "Connecting to VPS and pulling latest changes..."

ssh -o StrictHostKeyChecking=no -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    set -e
    
    echo "🔍 Checking application directory..."
    cd /opt/commerzbank || cd /root/commerzbank || cd ~/commerzbank || { echo "❌ Application directory not found!"; exit 1; }
    
    echo "📥 Pulling latest changes from git..."
    git pull origin main || { echo "❌ Git pull failed!"; exit 1; }
    
    echo "📦 Installing/updating dependencies..."
    cd backend
    npm install --production || echo "⚠️  npm install had warnings (continuing...)"
    
    echo "🔄 Restarting backend service..."
    # Try different restart methods
    if systemctl is-active --quiet commerzbank 2>/dev/null; then
        sudo systemctl restart commerzbank
        echo "✓ Restarted via systemctl"
    elif pm2 list 2>/dev/null | grep -q commerzbank; then
        pm2 restart commerzbank
        echo "✓ Restarted via PM2"
    elif [ -f server.js ]; then
        # Kill existing process and start new one
        pkill -f "node.*server.js" || true
        nohup node server.js > /tmp/commerzbank.log 2>&1 &
        echo "✓ Restarted via direct node process"
    else
        echo "⚠️  Could not restart service automatically"
        echo "   Please restart manually on the VPS"
    fi
    
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "📊 Service Status:"
    if systemctl is-active --quiet commerzbank 2>/dev/null; then
        systemctl status commerzbank --no-pager | head -10
    elif pm2 list 2>/dev/null | grep -q commerzbank; then
        pm2 list | grep commerzbank
    else
        ps aux | grep "node.*server.js" | grep -v grep || echo "⚠️  Service not found"
    fi
ENDSSH

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    echo ""
    print_info "Testing endpoints..."
    echo ""
    
    # Test health endpoint
    print_info "Testing health endpoint..."
    if curl -f -s "http://${VPS_HOST}/api/health" > /dev/null 2>&1; then
        print_success "Health endpoint: OK"
    else
        print_warning "Health endpoint: Not responding (may take a moment to start)"
    fi
    
    # Test admin login endpoint
    print_info "Testing admin login endpoint..."
    if curl -f -s -X POST "http://${VPS_HOST}/api/admin/login" \
         -H "Content-Type: application/json" \
         -d '{"password":"test"}' > /dev/null 2>&1; then
        print_success "Admin login endpoint: OK (accessible)"
    else
        print_warning "Admin login endpoint: Check manually"
    fi
    
    echo ""
    print_header "Deployment Summary"
    echo "🌐 Application URL: http://${VPS_HOST}"
    echo "🔧 API Base URL: http://${VPS_HOST}/api"
    echo "👤 Admin Panel: http://${VPS_HOST}/admin"
    echo "💚 Health Check: http://${VPS_HOST}/api/health"
    echo ""
    echo "📝 View logs on VPS:"
    echo "   SSH: ssh ${VPS_USER}@${VPS_HOST}"
    echo "   Logs: sudo journalctl -u commerzbank -f"
    echo "   Or: tail -f /tmp/commerzbank.log"
    echo ""
else
    print_error "Deployment failed!"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check SSH connection: ssh ${VPS_USER}@${VPS_HOST}"
    echo "2. Verify git repository: cd ${APP_DIR} && git status"
    echo "3. Check service status: systemctl status commerzbank"
    echo "4. View logs: journalctl -u commerzbank -f"
    exit 1
fi

