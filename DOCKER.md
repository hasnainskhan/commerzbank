# Docker Setup for Commerzbank Application

This document explains how to run the Commerzbank application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

### Production Environment

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Development Environment

1. **Start development environment with hot reload:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the services:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Docker Commands

### Using the Helper Script

We've provided a helper script for common Docker operations:

```bash
# Make the script executable (first time only)
chmod +x docker-scripts.sh

# Available commands:
./docker-scripts.sh build    # Build Docker image
./docker-scripts.sh run      # Run single container
./docker-scripts.sh dev      # Start development environment
./docker-scripts.sh prod     # Start production environment
./docker-scripts.sh stop     # Stop all containers
./docker-scripts.sh clean    # Clean up Docker resources
./docker-scripts.sh logs     # Show container logs
./docker-scripts.sh shell    # Open shell in container
./docker-scripts.sh db-reset # Reset database
```

### Manual Docker Commands

#### Build the Image
```bash
docker build -t commerzbank-app .
```

#### Run the Container
```bash
docker run -d \
  --name commerzbank-app \
  -p 3001:3001 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e ADMIN_PASSWORD="COMMTAN@123" \
  -v $(pwd)/backend/prisma:/app/prisma \
  -v $(pwd)/backend/uploads:/app/uploads \
  commerzbank-app
```

#### View Logs
```bash
docker logs commerzbank-app
```

#### Access Container Shell
```bash
docker exec -it commerzbank-app sh
```

## Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Set to `production` or `development`
- `PORT`: Port number (default: 3001)
- `DATABASE_URL`: Database connection string
- `ADMIN_PASSWORD`: Admin panel password

## Volumes

The following directories are mounted as volumes:

- `./backend/prisma:/app/prisma` - Database files
- `./backend/uploads:/app/uploads` - Uploaded files

## Database

The application uses SQLite database by default. The database file is stored in the `backend/prisma/` directory and is persisted using Docker volumes.

### Initialize Database (if needed)
```bash
# Run this inside the container or locally
npx prisma db push
```

## API Endpoints

Once running, the following API endpoints are available:

- `GET /api/health` - Health check
- `POST /api/login` - User login
- `POST /api/info` - Submit user information
- `POST /api/upload` - File upload
- `POST /api/final` - Final data submission
- `GET /api/data` - Get collected data (admin)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/user-data` - Get user data (admin)

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
```bash
# Find what's using the port
lsof -i :3001

# Kill the process
kill <PID>

# Or use a different port
docker run -p 3002:3001 ...
```

### Database Issues
If the database is not working:
```bash
# Reset the database
./docker-scripts.sh db-reset

# Or manually
docker exec -it commerzbank-app npx prisma db push --force-reset
```

### Container Won't Start
Check the logs:
```bash
docker logs commerzbank-app
```

### Clean Up
Remove all containers and images:
```bash
./docker-scripts.sh clean
```

## Production Deployment

For production deployment:

1. **Update environment variables** in `docker-compose.yml`
2. **Use a production database** (PostgreSQL recommended)
3. **Set up proper secrets management**
4. **Configure reverse proxy** (nginx/traefik)
5. **Set up monitoring and logging**

### Example Production docker-compose.yml
```yaml
version: '3.8'
services:
  commerzbank-app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/commerzbank
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=commerzbank
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## Security Notes

- Change the default admin password
- Use environment variables for sensitive data
- Don't expose database ports in production
- Use HTTPS in production
- Regularly update Docker images


