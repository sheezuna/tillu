# Tillu POS System - Docker Setup

This document provides comprehensive instructions for running the Tillu POS System using Docker and Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker (version 20.0 or higher)
- Docker Compose (version 2.0 or higher)
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

### Production Setup

1. **Clone and navigate to the repository:**
   ```bash
   git clone https://github.com/sheezuna/tillu.git
   cd tillu
   ```

2. **Run the setup script:**
   ```bash
   chmod +x scripts/docker-setup.sh
   ./scripts/docker-setup.sh
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.docker .env
   # Edit .env with your API keys
   nano .env
   ```

4. **Start the system:**
   ```bash
   docker-compose up -d
   ```

### Development Setup

For development with hot reload:

```bash
chmod +x scripts/docker-dev.sh
./scripts/docker-dev.sh
```

## 📱 Application Access

| Application | URL | Port |
|-------------|-----|------|
| POS Terminal | http://localhost:3001 | 3001 |
| Customer PWA | http://localhost:3002 | 3002 |
| Manager Dashboard | http://localhost:3003 | 3003 |
| Kitchen Display | http://localhost:3004 | 3004 |
| API Gateway | http://localhost:3000 | 3000 |

## 🗄️ Database Access

| Service | Host | Port | Credentials |
|---------|------|------|-------------|
| PostgreSQL | localhost | 5432 | tillu_user / tillu_password |
| Redis | localhost | 6379 | No auth |

## 🔧 Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api-gateway

# Restart specific service
docker-compose restart pos-terminal

# Rebuild and restart
docker-compose up -d --build
```

### Development Operations
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# View development logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U tillu_user -d tillu_pos

# Access Redis CLI
docker-compose exec redis redis-cli

# Backup database
docker-compose exec postgres pg_dump -U tillu_user tillu_pos > backup.sql

# Restore database
docker-compose exec -T postgres psql -U tillu_user tillu_pos < backup.sql
```

## 🏗️ Architecture

### Services Overview

| Service | Description | Technology |
|---------|-------------|------------|
| **api-gateway** | Main backend API | NestJS, TypeScript |
| **pos-terminal** | Staff POS interface | Next.js, React |
| **customer-pwa** | Customer ordering app | Next.js, PWA |
| **manager-dashboard** | Management interface | Next.js, React |
| **kitchen-display** | Kitchen operations | Next.js, React |
| **postgres** | Primary database | PostgreSQL 15 |
| **redis** | Cache & sessions | Redis 7 |
| **nginx** | Reverse proxy | Nginx (optional) |

### Network Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Database      │
│   Applications  │◄──►│   (NestJS)      │◄──►│   PostgreSQL    │
│   (Next.js)     │    │                 │    │   Redis         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security Configuration

### Production Security Checklist

- [ ] Change default database passwords
- [ ] Update JWT secret key
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging

### Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port

# Security
JWT_SECRET=your-super-secret-jwt-key

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SENDGRID_API_KEY=your-sendgrid-key
OPENAI_API_KEY=your-openai-key
```

## 📊 Monitoring & Logging

### Health Checks
```bash
# Check API Gateway health
curl http://localhost:3000/health

# Check all service status
docker-compose ps

# View resource usage
docker stats
```

### Log Management
```bash
# View all logs
docker-compose logs -f

# View logs with timestamps
docker-compose logs -f -t

# View last 100 lines
docker-compose logs --tail=100

# Export logs
docker-compose logs > tillu-logs.txt
```

## 🚀 Deployment

### Production Deployment

1. **Prepare production environment:**
   ```bash
   # Copy production compose file
   cp docker-compose.yml docker-compose.prod.yml
   
   # Update environment variables
   nano .env.production
   ```

2. **Deploy with production settings:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up SSL with Let's Encrypt:**
   ```bash
   # Add SSL certificates to ./ssl/ directory
   # Update nginx.conf with SSL configuration
   ```

### Scaling Services

```bash
# Scale frontend services
docker-compose up -d --scale pos-terminal=3 --scale customer-pwa=2

# Scale with load balancer
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Change ports in docker-compose.yml
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Memory issues:**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase Docker memory limit
   ```

4. **Build failures:**
   ```bash
   # Clean build cache
   docker system prune -a
   
   # Rebuild from scratch
   docker-compose build --no-cache
   ```

### Performance Optimization

1. **Database optimization:**
   ```bash
   # Tune PostgreSQL settings
   # Add to docker-compose.yml:
   command: postgres -c shared_preload_libraries=pg_stat_statements
   ```

2. **Redis optimization:**
   ```bash
   # Configure Redis memory
   command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
   ```

## 📈 Monitoring Setup

### Prometheus & Grafana (Optional)

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🆘 Support

For issues and support:
1. Check the logs: `docker-compose logs -f`
2. Verify service health: `docker-compose ps`
3. Check resource usage: `docker stats`
4. Review environment variables: `docker-compose config`

## 📝 License

This Docker configuration is part of the Tillu POS System.
