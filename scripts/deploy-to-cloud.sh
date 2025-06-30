
#!/bin/bash

# Tourism Concierge AI - Cloud Deployment Script
# Deploy backend services to Google Cloud Run (or other cloud platforms)

set -e

# Configuration
PROJECT_NAME="tourism-concierge-ai"
REGION="us-central1"
AI_SERVICE_NAME="ai-core-service"
B2B_SERVICE_NAME="b2b-backend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required environment variables are set
    required_vars=(
        "OPENAI_API_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "SUPABASE_DB_PASSWORD"
        "JWT_SECRET"
        "SMTP_HOST"
        "SMTP_USER"
        "SMTP_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set!"
        fi
    done
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed!"
    fi
    
    log "✅ Prerequisites check passed!"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build AI Core Service
    log "Building AI Core Service image..."
    docker build -t ${PROJECT_NAME}/${AI_SERVICE_NAME}:latest \
        -f docker/Dockerfile.ai-core \
        ./ai-core-service/
    
    # Build B2B Backend
    log "Building B2B Backend image..."
    docker build -t ${PROJECT_NAME}/${B2B_SERVICE_NAME}:latest \
        -f docker/Dockerfile.b2b-backend \
        ./b2b-backend/
    
    log "✅ Docker images built successfully!"
}

# Deploy to Google Cloud Run
deploy_to_cloud_run() {
    log "Deploying to Google Cloud Run..."
    
    # Set Google Cloud project
    gcloud config set project ${PROJECT_NAME}
    
    # Deploy AI Core Service
    log "Deploying AI Core Service..."
    gcloud run deploy ${AI_SERVICE_NAME} \
        --image ${PROJECT_NAME}/${AI_SERVICE_NAME}:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --set-env-vars OPENAI_API_KEY=${OPENAI_API_KEY} \
        --memory 1Gi \
        --cpu 1
    
    # Get AI Core Service URL
    AI_CORE_URL=$(gcloud run services describe ${AI_SERVICE_NAME} \
        --platform managed \
        --region ${REGION} \
        --format 'value(status.url)')
    
    log "AI Core Service deployed at: ${AI_CORE_URL}"
    
    # Deploy B2B Backend
    log "Deploying B2B Backend..."
    gcloud run deploy ${B2B_SERVICE_NAME} \
        --image ${PROJECT_NAME}/${B2B_SERVICE_NAME}:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --set-env-vars \
            DATABASE_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres",\
            SUPABASE_URL="https://gjhuxgjheaywfwrpctah.supabase.co",\
            SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}",\
            AI_CORE_SERVICE_URL="${AI_CORE_URL}",\
            SECRET_KEY="${JWT_SECRET}",\
            EMAIL_HOST="${SMTP_HOST}",\
            EMAIL_USER="${SMTP_USER}",\
            EMAIL_PASSWORD="${SMTP_PASSWORD}" \
        --memory 1Gi \
        --cpu 1
    
    # Get B2B Backend URL
    B2B_BACKEND_URL=$(gcloud run services describe ${B2B_SERVICE_NAME} \
        --platform managed \
        --region ${REGION} \
        --format 'value(status.url)')
    
    log "B2B Backend deployed at: ${B2B_BACKEND_URL}"
    
    log "✅ Cloud deployment completed!"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    # Check AI Core Service
    if curl -f "${AI_CORE_URL}/health" &> /dev/null; then
        log "✅ AI Core Service is healthy"
    else
        error "AI Core Service health check failed!"
    fi
    
    # Check B2B Backend
    if curl -f "${B2B_BACKEND_URL}/health" &> /dev/null; then
        log "✅ B2B Backend is healthy"
    else
        error "B2B Backend health check failed!"
    fi
}

# Deploy frontends (optional)
deploy_frontends() {
    log "Deploying frontend applications..."
    
    # Deploy B2C Frontend to Vercel
    if command -v vercel &> /dev/null && [ -d "b2c-frontend" ]; then
        log "Deploying B2C Frontend to Vercel..."
        cd b2c-frontend
        
        # Set environment variables
        echo "VITE_API_URL=${B2B_BACKEND_URL}/api" > .env.production
        echo "VITE_SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co" >> .env.production
        echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHV4Z2poZWF5d2Z3cnBjdGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODM3ODQsImV4cCI6MjA2Njg1OTc4NH0.UrqW99pZe9X7maAcXlw5EdKX445CRngOkAAn13b4euQ" >> .env.production
        
        vercel --prod --confirm
        cd ..
        log "✅ B2C Frontend deployed!"
    fi
    
    # Deploy B2B Frontend to Vercel
    if command -v vercel &> /dev/null && [ -d "b2b-dashboard" ]; then
        log "Deploying B2B Dashboard to Vercel..."
        cd b2b-dashboard
        
        # Set environment variables
        echo "VITE_API_URL=${B2B_BACKEND_URL}/api" > .env.production
        
        vercel --prod --confirm
        cd ..
        log "✅ B2B Dashboard deployed!"
    fi
}

# Main deployment function
main() {
    log "🚀 Starting Tourism Concierge AI deployment to cloud..."
    
    check_prerequisites
    build_images
    deploy_to_cloud_run
    run_health_checks
    deploy_frontends
    
    log "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Deployment Summary"
    echo "===================="
    echo "AI Core Service: ${AI_CORE_URL}"
    echo "B2B Backend: ${B2B_BACKEND_URL}"
    echo ""
    echo "🔐 Test Login (B2B Dashboard):"
    echo "Email: demo@safariexperts.com"
    echo "Password: password123"
    echo ""
    echo "📊 Next Steps:"
    echo "1. Update frontend environment variables with deployed URLs"
    echo "2. Test end-to-end workflows"
    echo "3. Set up monitoring and alerting"
    echo "4. Configure custom domains (optional)"
}

# Run main function
main "$@"
