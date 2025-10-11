#!/bin/bash

# Docker management scripts for Commerzbank application

case "$1" in
    "build")
        echo "Building Docker image..."
        docker build -t commerzbank-app .
        ;;
    "run")
        echo "Running Docker container..."
        docker run -d \
            --name commerzbank-app \
            -p 3001:3001 \
            -v $(pwd)/backend/prisma:/app/prisma \
            -v $(pwd)/backend/uploads:/app/uploads \
            commerzbank-app
        ;;
    "dev")
        echo "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    "prod")
        echo "Starting production environment..."
        docker-compose up --build -d
        ;;
    "stop")
        echo "Stopping containers..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        ;;
    "clean")
        echo "Cleaning up Docker resources..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        ;;
    "logs")
        echo "Showing logs..."
        docker-compose logs -f
        ;;
    "shell")
        echo "Opening shell in container..."
        docker exec -it commerzbank-app sh
        ;;
    "db-reset")
        echo "Resetting database..."
        docker exec -it commerzbank-app npx prisma db push --force-reset
        ;;
    *)
        echo "Usage: $0 {build|run|dev|prod|stop|clean|logs|shell|db-reset}"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker image"
        echo "  run      - Run single container"
        echo "  dev      - Start development environment with hot reload"
        echo "  prod     - Start production environment"
        echo "  stop     - Stop all containers"
        echo "  clean    - Clean up Docker resources"
        echo "  logs     - Show container logs"
        echo "  shell    - Open shell in container"
        echo "  db-reset - Reset database"
        exit 1
        ;;
esac


