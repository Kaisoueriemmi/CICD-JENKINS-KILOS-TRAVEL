# AirWeight - Deployment Guide

## 🚀 Production Deployment

This guide covers deploying AirWeight to production using various platforms.

---

## Prerequisites

- Domain name configured
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL database (managed or self-hosted)
- Redis instance (managed or self-hosted)
- Docker & Docker Compose installed (for Docker deployment)

---

## Option 1: Docker Deployment (Recommended)

### 1. Prepare Production Environment

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - airweight_network

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - airweight_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
      - DEBUG=False
    depends_on:
      - postgres
      - redis
    networks:
      - airweight_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - airweight_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    networks:
      - airweight_network

networks:
  airweight_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### 2. Create Production Dockerfiles

**backend/Dockerfile.prod**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

**frontend/Dockerfile.prod**:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
```

### 3. Configure Nginx

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name airweight.io www.airweight.io;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name airweight.io www.airweight.io;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # API Docs
        location /docs {
            proxy_pass http://backend;
        }
    }
}
```

### 4. Deploy

```bash
# Set environment variables
export SECRET_KEY=$(openssl rand -hex 32)
export DATABASE_URL="postgresql://user:pass@postgres:5432/airweight"
# ... other variables

# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Initialize database
docker-compose -f docker-compose.prod.yml exec backend python init_db.py

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Option 2: Cloud Platform Deployment

### Heroku

1. **Install Heroku CLI**
2. **Create Heroku Apps**:

```bash
heroku create airweight-backend
heroku create airweight-frontend
```

3. **Add PostgreSQL**:

```bash
heroku addons:create heroku-postgresql:hobby-dev -a airweight-backend
```

4. **Set Environment Variables**:

```bash
heroku config:set SECRET_KEY=your-secret-key -a airweight-backend
```

5. **Deploy**:

```bash
git push heroku main
```

### AWS (EC2 + RDS)

1. **Launch EC2 Instance** (Ubuntu 22.04)
2. **Install Docker & Docker Compose**
3. **Create RDS PostgreSQL Instance**
4. **Configure Security Groups**
5. **Deploy using Docker Compose**

### DigitalOcean

1. **Create Droplet** (Docker pre-installed)
2. **Create Managed PostgreSQL Database**
3. **Configure Firewall**
4. **Deploy using Docker Compose**

---

## Environment Variables (Production)

Create `.env.production`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/airweight_prod
POSTGRES_USER=airweight_prod
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=airweight_prod

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Environment
ENVIRONMENT=production
DEBUG=False

# API Keys
GOOGLE_VISION_API_KEY=<your-key>
STRIPE_SECRET_KEY=<your-key>
STRIPE_WEBHOOK_SECRET=<your-secret>

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-key>
EMAIL_FROM=noreply@airweight.io

# Frontend
NEXT_PUBLIC_API_URL=https://api.airweight.io
NEXT_PUBLIC_APP_URL=https://airweight.io

# CORS
CORS_ORIGINS=https://airweight.io,https://www.airweight.io

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

---

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d airweight.io -d www.airweight.io

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Database Migrations

```bash
# Create migration
docker-compose exec backend alembic revision --autogenerate -m "Description"

# Apply migration
docker-compose exec backend alembic upgrade head

# Rollback
docker-compose exec backend alembic downgrade -1
```

---

## Monitoring & Logging

### Application Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U airweight airweight_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U airweight airweight_db < backup.sql
```

### Health Checks

- Backend: https://api.airweight.io/health
- Frontend: https://airweight.io

---

## Performance Optimization

1. **Enable Gzip Compression** (Nginx)
2. **Use CDN** for static assets
3. **Database Connection Pooling** (already configured)
4. **Redis Caching** for frequent queries
5. **Image Optimization** (Next.js automatic)

---

## Security Checklist

- ✅ HTTPS enabled
- ✅ Strong SECRET_KEY
- ✅ Database credentials secured
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Security headers set
- ✅ Regular backups
- ✅ Firewall configured
- ✅ Dependencies updated

---

## Troubleshooting

### Backend not starting

```bash
docker-compose logs backend
# Check DATABASE_URL
# Check SECRET_KEY is set
```

### Database connection error

```bash
# Test connection
docker-compose exec backend python -c "from app.core.database import engine; print(engine.connect())"
```

### Frontend build fails

```bash
# Clear cache
docker-compose exec frontend rm -rf .next
docker-compose restart frontend
```

---

## Scaling

### Horizontal Scaling

- Use load balancer (Nginx, AWS ALB)
- Multiple backend instances
- Shared PostgreSQL and Redis

### Vertical Scaling

- Increase container resources
- Upgrade database instance
- Add more workers to Gunicorn

---

**For support, contact: devops@airweight.io**
