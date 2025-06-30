
#!/bin/bash

# Tourism Concierge AI - Production Deployment Script

set -e

echo "🚀 Deploying Tourism Concierge AI to Production..."

# Configuration
ENVIRONMENT=${1:-production}
DOMAIN=${2:-yourdomain.com}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if environment file exists
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        error "Environment file .env.${ENVIRONMENT} not found!"
    fi
    
    # Load environment variables
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
    
    # Check required variables
    required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "OPENAI_API_KEY" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set!"
        fi
    done
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed!"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed!"
    fi
    
    log "✅ Pre-deployment checks passed!"
}

# Build production images
build_images() {
    log "Building production Docker images..."
    
    # Build with production optimizations
    docker build -t tourism-ai/ai-core:${ENVIRONMENT} \
        --build-arg ENV=${ENVIRONMENT} \
        ./ai-core-service
    
    docker build -t tourism-ai/b2b-backend:${ENVIRONMENT} \
        --build-arg ENV=${ENVIRONMENT} \
        ./b2b-backend
    
    log "✅ Images built successfully!"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    if [ ! -d "./ssl" ]; then
        mkdir -p ./ssl
    fi
    
    # Check if certificates exist
    if [ ! -f "./ssl/fullchain.pem" ] || [ ! -f "./ssl/privkey.pem" ]; then
        warn "SSL certificates not found!"
        echo "Please place your SSL certificates in ./ssl/ directory:"
        echo "  - fullchain.pem (certificate chain)"
        echo "  - privkey.pem (private key)"
        echo ""
        echo "For Let's Encrypt certificates, you can use:"
        echo "  sudo certbot certonly --standalone -d ${DOMAIN}"
        echo "  sudo cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ./ssl/"
        echo "  sudo cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ./ssl/"
        echo "  sudo chown \$(whoami) ./ssl/*.pem"
        
        read -p "Press enter after setting up SSL certificates..."
    fi
    
    log "✅ SSL certificates ready!"
}

# Database migration
run_migrations() {
    log "Running database migrations..."
    
    # Check Supabase connection
    if ! curl -f "${SUPABASE_URL}/rest/v1/" -H "apikey: ${SUPABASE_ANON_KEY}" &> /dev/null; then
        error "Cannot connect to Supabase! Check SUPABASE_URL and keys."
    fi
    
    # Run migration script if exists
    if [ -f "scripts/migrate.py" ]; then
        python3 scripts/migrate.py
    fi
    
    log "✅ Database migrations completed!"
}

# Deploy backend services
deploy_backend() {
    log "Deploying backend services..."
    
    # Update nginx configuration with actual domain
    sed -i "s/yourdomain.com/${DOMAIN}/g" deploy/nginx.conf
    
    # Deploy with Docker Compose
    docker-compose -f deploy/docker-compose.yml down || true
    docker-compose -f deploy/docker-compose.yml up -d
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 30
    
    # Health checks
    log "Performing health checks..."
    
    # Check AI Core Service
    if curl -f "http://localhost:8000/health" &> /dev/null; then
        log "✅ AI Core Service is healthy"
    else
        error "AI Core Service health check failed!"
    fi
    
    # Check B2B Backend
    if curl -f "http://localhost:8001/health" &> /dev/null; then
        log "✅ B2B Backend is healthy"
    else
        error "B2B Backend health check failed!"
    fi
    
    # Check Nginx
    if curl -f "http://localhost/health" &> /dev/null; then
        log "✅ Nginx is healthy"
    else
        error "Nginx health check failed!"
    fi
    
    log "✅ Backend services deployed successfully!"
}

# Deploy frontend applications
deploy_frontend() {
    log "Deploying frontend applications..."
    
    # Deploy B2C Frontend to Vercel
    if command -v vercel &> /dev/null; then
        log "Deploying B2C Frontend to Vercel..."
        cd b2c-frontend
        vercel --prod --confirm
        cd ..
        log "✅ B2C Frontend deployed!"
    else
        warn "Vercel CLI not found. Skipping B2C frontend deployment."
    fi
    
    # Deploy B2B Dashboard to Vercel
    if command -v vercel &> /dev/null; then
        log "Deploying B2B Dashboard to Vercel..."
        cd b2b-dashboard
        vercel --prod --confirm
        cd ..
        log "✅ B2B Dashboard deployed!"
    else
        warn "Vercel CLI not found. Skipping B2B dashboard deployment."
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directory
    mkdir -p ./monitoring
    
    # Setup log rotation
    cat > ./monitoring/logrotate.conf << EOF
/var/log/tourism-ai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/tourism-ai/deploy/docker-compose.yml restart nginx
    endscript
}
EOF
    
    # Setup basic monitoring script
    cat > ./monitoring/health_check.sh << EOF
#!/bin/bash
# Basic health monitoring script

SERVICES=("ai-core-service:8000" "b2b-backend:8001")
EMAIL="alerts@${DOMAIN}"

for service in "\${SERVICES[@]}"; do
    if ! curl -f "http://localhost:\${service##*:}/health" &> /dev/null; then
        echo "Service \${service%:*} is down!" | mail -s "Service Alert" \$EMAIL
    fi
done
EOF
    
    chmod +x ./monitoring/health_check.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/tourism-ai/monitoring/health_check.sh") | crontab -
    
    log "✅ Basic monitoring setup completed!"
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Create backup script
    cat > ./scripts/backup.sh << EOF
#!/bin/bash
# Backup script for Tourism Concierge AI

BACKUP_DIR="/opt/backups/tourism-ai/\$(date +%Y%m%d)"
mkdir -p \$BACKUP_DIR

# Backup database (Supabase backup via API)
echo "Creating database backup..."
# Implementation depends on your backup strategy

# Backup application files
tar -czf "\$BACKUP_DIR/app-backup.tar.gz" -C /opt/tourism-ai --exclude=node_modules --exclude=.git .

log "Backup completed: \$BACKUP_DIR"
EOF
    
    chmod +x ./scripts/backup.sh
    
    # Setup daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/tourism-ai/scripts/backup.sh") | crontab -
    
    # Create sample operator if not exists
    log "Creating sample operator account..."
    docker-compose -f deploy/docker-compose.yml exec b2b-backend python create_sample_data.py || true
    
    log "✅ Post-deployment tasks completed!"
}

# Display deployment summary
deployment_summary() {
    log "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Deployment Summary"
    echo "===================="
    echo "Environment: ${ENVIRONMENT}"
    echo "Domain: ${DOMAIN}"
    echo ""
    echo "🌐 Services:"
    echo "  - AI Core Service: https://${DOMAIN}/ai/"
    echo "  - B2B Backend API: https://${DOMAIN}/api/"
    echo "  - API Documentation: https://${DOMAIN}/api/docs"
    echo ""
    echo "🔐 Test Login (B2B Dashboard):"
    echo "  Email: demo@safariexperts.com"
    echo "  Password: password123"
    echo ""
    echo "📊 Monitoring:"
    echo "  - Health Check: https://${DOMAIN}/health"
    echo "  - Logs: docker-compose -f deploy/docker-compose.yml logs -f"
    echo ""
    echo "🛠️  Management Commands:"
    echo "  - Restart services: docker-compose -f deploy/docker-compose.yml restart"
    echo "  - View logs: docker-compose -f deploy/docker-compose.yml logs -f [service]"
    echo "  - Update: git pull && ./scripts/deploy.sh ${ENVIRONMENT} ${DOMAIN}"
    echo ""
}

# Main deployment flow
main() {
    log "Starting deployment to ${ENVIRONMENT} environment..."
    
    pre_deployment_checks
    build_images
    setup_ssl
    run_migrations
    deploy_backend
    deploy_frontend
    setup_monitoring
    post_deployment
    deployment_summary
}

# Run main function
main "$@"
