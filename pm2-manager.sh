#!/bin/bash

# PM2 Management Script for Commerzbank Application

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

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install it first: npm install -g pm2"
    exit 1
fi

# Function to show help
show_help() {
    echo "PM2 Management Script for Commerzbank Application"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start both frontend and backend with PM2"
    echo "  stop      - Stop all PM2 processes"
    echo "  restart   - Restart all PM2 processes"
    echo "  status    - Show PM2 process status"
    echo "  logs      - Show logs for all processes"
    echo "  logs-backend - Show backend logs only"
    echo "  logs-frontend - Show frontend logs only"
    echo "  monitor   - Open PM2 monitoring dashboard"
    echo "  delete    - Delete all PM2 processes"
    echo "  save      - Save current PM2 process list"
    echo "  startup   - Setup PM2 to start on system boot"
    echo "  help      - Show this help message"
    echo ""
}

# Function to start applications
start_apps() {
    print_header "Starting Commerzbank Applications with PM2"
    
    # Stop any existing processes first
    pm2 delete all 2>/dev/null || true
    
    # Start applications using ecosystem file
    print_status "Starting backend and frontend..."
    pm2 start ecosystem.config.js
    
    # Save PM2 process list
    pm2 save
    
    print_status "Applications started successfully!"
    print_status "Backend: http://localhost:3001"
    print_status "Frontend: http://localhost:3000"
    print_status "Admin Panel: http://localhost:3000/admin"
}

# Function to stop applications
stop_apps() {
    print_header "Stopping Commerzbank Applications"
    pm2 stop all
    print_status "All applications stopped"
}

# Function to restart applications
restart_apps() {
    print_header "Restarting Commerzbank Applications"
    pm2 restart all
    print_status "All applications restarted"
}

# Function to show status
show_status() {
    print_header "PM2 Process Status"
    pm2 status
}

# Function to show logs
show_logs() {
    print_header "PM2 Logs"
    pm2 logs
}

# Function to show backend logs
show_backend_logs() {
    print_header "Backend Logs"
    pm2 logs commerzbank-backend
}

# Function to show frontend logs
show_frontend_logs() {
    print_header "Frontend Logs"
    pm2 logs commerzbank-frontend
}

# Function to open monitor
open_monitor() {
    print_header "Opening PM2 Monitor"
    pm2 monit
}

# Function to delete all processes
delete_processes() {
    print_header "Deleting All PM2 Processes"
    pm2 delete all
    print_status "All processes deleted"
}

# Function to save process list
save_processes() {
    print_header "Saving PM2 Process List"
    pm2 save
    print_status "Process list saved"
}

# Function to setup startup
setup_startup() {
    print_header "Setting up PM2 Startup"
    pm2 startup
    print_warning "Please run the command shown above as root/sudo to complete startup setup"
}

# Main script logic
case "$1" in
    start)
        start_apps
        ;;
    stop)
        stop_apps
        ;;
    restart)
        restart_apps
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    logs-backend)
        show_backend_logs
        ;;
    logs-frontend)
        show_frontend_logs
        ;;
    monitor)
        open_monitor
        ;;
    delete)
        delete_processes
        ;;
    save)
        save_processes
        ;;
    startup)
        setup_startup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
