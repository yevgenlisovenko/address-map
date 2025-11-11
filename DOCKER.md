# Docker Deployment Guide

Complete guide for running the Real-time Map application using Docker containers.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Development](#development)
- [Production](#production)
- [Commands Reference](#commands-reference)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

---

## Prerequisites

### Required Software

- **Docker**: 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.0+ (included with Docker Desktop)

### Verify Installation

```bash
docker --version
# Docker version 24.0.0 or higher

docker compose version
# Docker Compose version v2.20.0 or higher
```

---

## Quick Start

### 1. Clone and Navigate

```bash
cd real-time-map
```

### 2. Build and Run

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Access the application
open http://localhost:3000
```

### 3. Stop

```bash
docker compose down
```

---

## Architecture

### Container Structure

```
┌─────────────────────────────────────┐
│         Docker Network              │
│  (real-time-map-network - bridge)         │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Frontend Container          │  │
│  │  - Nginx:alpine             │  │
│  │  - Serves React SPA         │  │
│  │  - Port: 80 → 3000          │  │
│  └──────────────────────────────┘  │
│              ↓                      │
│  ┌──────────────────────────────┐  │
│  │  Backend Container           │  │
│  │  - Node.js 20-alpine        │  │
│  │  - Express + Socket.IO      │  │
│  │  - Port: 3001 → 3001        │  │
│  └──────────────────────────────┘  │
│              ↓                      │
│     Nominatim API (external)        │
└─────────────────────────────────────┘
```

### Image Details

| Service | Base Image | Final Size | Build Time |
|---------|-----------|------------|------------|
| Backend | `node:20-alpine` | ~150MB | ~2-3 min |
| Frontend | `nginx:alpine` | ~25MB | ~3-5 min |

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit as needed
nano .env
```

**Default Configuration:**

```env
# Backend
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production

# Frontend (build-time)
VITE_BACKEND_URL=http://localhost:3001
VITE_DEPLOYMENT_CONFIG=default
```

### Deployment Configuration

The frontend supports multiple deployment configurations via the `VITE_DEPLOYMENT_CONFIG` environment variable. This controls:
- **Marker icon mappings** - Which property to use for marker colors (formCode, partnerNameShort, etc.)
- **Statistics configuration** - Which properties to track, aggregations to calculate
- **Filter configuration** - Which filters to display (static dropdowns, dynamic dropdowns, text inputs)

**Available configurations:**
- `default` - Uses formCode-based marker icons (HO3, HO4, HO6, HF9), tracks state and formCode
- `client-a` - Uses partnerNameShort-based marker icons, tracks state and partnerNameShort

**To build with a specific configuration:**

```bash
# Build with default configuration
docker compose build frontend

# Build with client-a configuration
VITE_DEPLOYMENT_CONFIG=client-a docker compose build frontend
docker compose up -d

# Or set in .env file
echo "VITE_DEPLOYMENT_CONFIG=client-a" >> .env
docker compose build frontend
```

**Multi-Origin CORS Support:**

The backend supports multiple CORS origins using comma-separated values:

```env
# Single origin
CORS_ORIGIN=http://localhost:3000

# Multiple origins
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

### Port Mapping

| Service | Container Port | Host Port | Description |
|---------|---------------|-----------|-------------|
| Frontend | 80 | 3000 | Web application |
| Backend | 3001 | 3001 | API + WebSocket |

**To change host ports**, edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Access at http://localhost:8080
```

---

## Development

### Development Mode with Live Reload

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    volumes:
      - ./backend/src:/app/src
    environment:
      - NODE_ENV=development
    command: node --watch src/server.js

  frontend:
    build:
      context: ./frontend
      target: build  # Use build stage only
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    command: npm run dev -- --host
    ports:
      - "5173:5173"
```

**Run development environment:**

```bash
docker compose -f docker-compose.dev.yml up
```

### Rebuilding After Code Changes

```bash
# Rebuild specific service
docker compose build backend
docker compose build frontend

# Rebuild all services
docker compose build

# Force rebuild (no cache)
docker compose build --no-cache
```

---

## Production

### Production Deployment

#### 1. Update Environment Variables

```env
# .env
CORS_ORIGIN=https://yourapp.com
VITE_BACKEND_URL=https://api.yourapp.com
NODE_ENV=production
```

#### 2. Build Production Images

```bash
docker compose build --no-cache
```

#### 3. Run with Production Settings

```bash
docker compose up -d
```

### Production Best Practices

#### 1. Use Reverse Proxy (Nginx/Traefik)

```yaml
# docker-compose.prod.yml
services:
  reverse-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

#### 2. Add SSL/TLS

```bash
# Using Let's Encrypt with Certbot
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourapp.com -d api.yourapp.com
```

#### 3. Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

#### 4. Logging

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Commands Reference

### Container Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# Stop and remove volumes
docker compose down -v

# View running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
```

### Building

```bash
# Build all images
docker compose build

# Build specific service
docker compose build backend

# Build without cache
docker compose build --no-cache

# Build with progress
docker compose build --progress=plain
```

### Debugging

```bash
# Execute command in running container
docker compose exec backend sh
docker compose exec frontend sh

# View container details
docker inspect real-time-map-backend
docker inspect real-time-map-frontend

# Check health status
docker compose ps

# View resource usage
docker stats
```

### Cleanup

```bash
# Remove stopped containers
docker compose rm -f

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: Frontend shows "Disconnected" status

**Solutions:**

1. **Check environment variable:**
   ```bash
   # Rebuild frontend with correct backend URL
   docker compose build --build-arg VITE_BACKEND_URL=http://localhost:3001 frontend
   ```

2. **Verify CORS settings:**
   ```bash
   # Check backend logs
   docker compose logs backend | grep CORS
   ```

3. **Check network:**
   ```bash
   docker network inspect real-time-map-network
   ```

### Port Already in Use

**Problem**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solutions:**

```bash
# Find process using port
lsof -i :3000
sudo lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3005:80"  # Changed from 3000
```

### Build Fails

**Problem**: Build errors or timeouts

**Solutions:**

```bash
# Clear build cache
docker builder prune

# Rebuild without cache
docker compose build --no-cache

# Check Docker disk space
docker system df

# Free up space
docker system prune -a
```

### Container Keeps Restarting

**Problem**: Service restarts continuously

**Solutions:**

```bash
# Check logs
docker compose logs --tail=100 backend

# Check health status
docker inspect real-time-map-backend | grep -A 10 Health

# Disable health check temporarily
# Comment out healthcheck in docker-compose.yml
```

### Permission Errors

**Problem**: Permission denied errors in containers

**Solutions:**

```bash
# Check file ownership
ls -la backend/src
ls -la frontend/dist

# Fix ownership (if needed)
sudo chown -R $USER:$USER .

# Rebuild with proper permissions
docker compose build
```

---

## Advanced Usage

### Multi-Stage Builds

Our Dockerfiles use multi-stage builds for optimization:

**Backend:**
- Stage 1: Install production dependencies
- Stage 2: Copy dependencies + source code

**Frontend:**
- Stage 1: Build React application
- Stage 2: Serve with Nginx

### Health Checks

Both containers include health checks:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 20s
```

**Monitor health:**

```bash
docker compose ps
# Look for "healthy" status
```

### Networking

Containers communicate via bridge network:

```bash
# Inspect network
docker network inspect real-time-map-network

# From backend, ping frontend
docker compose exec backend ping frontend

# From frontend, ping backend
docker compose exec frontend ping backend
```

### Volume Mounting (Development)

Mount source code for live reload:

```yaml
volumes:
  - ./backend/src:/app/src:ro  # read-only
  - ./frontend/src:/app/src:ro
```

### Docker Hub Deployment

#### 1. Tag Images

```bash
docker tag real-time-map-backend:latest yourusername/real-time-map-backend:latest
docker tag real-time-map-frontend:latest yourusername/real-time-map-frontend:latest
```

#### 2. Push to Docker Hub

```bash
docker login
docker push yourusername/real-time-map-backend:latest
docker push yourusername/real-time-map-frontend:latest
```

#### 3. Pull and Run

```bash
docker pull yourusername/real-time-map-backend:latest
docker pull yourusername/real-time-map-frontend:latest
docker compose up -d
```

### CI/CD Integration

#### GitHub Actions Example

`.github/workflows/docker.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build images
        run: docker compose build

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push images
        run: docker compose push
```

---

## Performance Optimization

### Build Optimization

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with parallel jobs
docker compose build --parallel
```

### Image Size Reduction

- ✅ Multi-stage builds (implemented)
- ✅ Alpine Linux base images (implemented)
- ✅ `.dockerignore` files (implemented)
- ✅ Production dependencies only (implemented)

### Runtime Optimization

```yaml
# Limit memory and CPU
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
```

---

## Security Considerations

### Current Security Features

✅ Non-root user in containers
✅ Security headers in nginx
✅ Health checks enabled
✅ Minimal base images (Alpine)
✅ Production dependencies only

### Additional Recommendations

1. **Scan images for vulnerabilities:**
   ```bash
   docker scan real-time-map-backend:latest
   docker scan real-time-map-frontend:latest
   ```

2. **Use Docker secrets for sensitive data:**
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

3. **Enable Content Trust:**
   ```bash
   export DOCKER_CONTENT_TRUST=1
   ```

4. **Regular updates:**
   ```bash
   docker compose pull
   docker compose up -d
   ```

---

## Monitoring

### Container Metrics

```bash
# Real-time stats
docker stats

# Specific container
docker stats real-time-map-backend

# Export to JSON
docker stats --format "{{json .}}" --no-stream
```

### Logging

```bash
# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Since timestamp
docker compose logs --since="2024-01-01T00:00:00"

# Export logs
docker compose logs > app.log
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

**Last Updated**: 2025-10-06
