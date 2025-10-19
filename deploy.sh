#!/bin/bash

###############################################################################
# Commerzbank App Deployment Script
# Deploys the app with anti-bot middleware and mobile compatibility fixes
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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Build the application
build_app() {
    print_header "Building Application"
    print_info "Building Docker image with mobile fixes and anti-bot middleware..."
    
    if docker-compose build --no-cache; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Start the application
start_app() {
    print_header "Starting Application"
    print_info "Starting containers..."
    
    if docker-compose up -d; then
        print_success "Application started successfully"
    else
        print_error "Failed to start application"
        exit 1
    fi
}

# Check application health
check_health() {
    print_header "Health Check"
    print_info "Waiting for application to be ready..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:3001/api/health &> /dev/null; then
            print_success "Application is healthy and ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo ""
    print_warning "Health check timeout. Application may still be starting..."
    print_info "Check logs with: docker-compose logs -f"
}

# Display status
show_status() {
    print_header "Deployment Status"
    
    echo -e "${GREEN}🚀 Deployment Complete!${NC}"
    echo ""
    echo "📱 Application URLs:"
    echo "   Main App:    http://localhost:3001"
    echo "   API:         http://localhost:3001/api"
    echo "   Admin Panel: http://localhost:3001/admin"
    echo "   Health:      http://localhost:3001/api/health"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    echo "🛡️  Features Enabled:"
    echo "   ✓ Anti-Bot Middleware"
    echo "   ✓ Mobile Compatibility (iOS/Android)"
    echo "   ✓ Rate Limiting (60 req/min)"
    echo "   ✓ File Upload Support"
    echo "   ✓ Auto-restart on failure"
    echo ""
    echo "📱 Test on iPhone:"
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ipconfig getifaddr en0 2>/dev/null || echo "YOUR_IP")
    echo "   Open Safari: http://${LOCAL_IP}:3001"
    echo ""
    echo "📝 Useful Commands:"
    echo "   View logs:       docker-compose logs -f"
    echo "   Stop app:        docker-compose down"
    echo "   Restart app:     docker-compose restart"
    echo "   View stats:      docker stats commerzbank-app"
    echo ""
}

# Stop application
stop_app() {
    print_header "Stopping Application"
    print_info "Stopping containers..."
    
    if docker-compose down; then
        print_success "Application stopped successfully"
    else
        print_error "Failed to stop application"
        exit 1
    fi
}

# View logs
view_logs() {
    print_header "Viewing Logs"
    docker-compose logs -f
}

# Show help
show_help() {
    echo ""
    echo "Commerzbank App Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Build and deploy the application (default)"
    echo "  start     - Start the application"
    echo "  stop      - Stop the application"
    echo "  restart   - Restart the application"
    echo "  logs      - View application logs"
    echo "  status    - Show application status"
    echo "  rebuild   - Rebuild and redeploy from scratch"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh              # Deploy the app"
    echo "  ./deploy.sh logs         # View logs"
    echo "  ./deploy.sh rebuild      # Rebuild everything"
    echo ""
}

# Main deployment function
deploy() {
    print_header "🐳 Commerzbank App Deployment"
    
    check_prerequisites
    build_app
    start_app
    sleep 5
    check_health
    show_status
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    start)
        print_header "Starting Application"
        start_app
        check_health
        show_status
        ;;
    stop)
        stop_app
        ;;
    restart)
        print_header "Restarting Application"
        docker-compose restart
        check_health
        show_status
        ;;
    rebuild)
        print_header "Rebuilding Application"
        stop_app
        build_app
        start_app
        check_health
        show_status
        ;;
    logs)
        view_logs
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

