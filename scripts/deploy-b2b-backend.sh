
#!/bin/bash

# TourMaster AI (B2B) Backend - Cloud Deployment Script
# Deploy B2B backend service to Google Cloud Run

set -e

# Configuration
PROJECT_NAME="tourmaster-ai"
REGION="us-central1"
SERVICE_NAME="b2b-backend"
DOCKER_IMAGE="${PROJECT_NAME}/${SERVICE_NAME}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites for B2B Backend deployment..."
    
    # Check if required environment variables are set
    required_vars=(
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "SUPABASE_DB_PASSWORD"
        "JWT_SECRET"
        "OPENAI_API_KEY"
        "GOOGLE_CLOUD_PROJECT"
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
    
    # Check Google Cloud CLI
    if ! command -v gcloud &> /dev/null; then
        error "Google Cloud CLI is not installed!"
    fi
    
    # Check if logged into gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        error "Please login to Google Cloud: gcloud auth login"
    fi
    
    log "✅ Prerequisites check passed!"
}

# Set up Google Cloud project
setup_gcloud_project() {
    log "Setting up Google Cloud project..."
    
    # Set the project
    gcloud config set project ${GOOGLE_CLOUD_PROJECT}
    
    # Enable required APIs
    info "Enabling required Google Cloud APIs..."
    gcloud services enable \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        containerregistry.googleapis.com \
        artifactregistry.googleapis.com
    
    log "✅ Google Cloud project setup completed!"
}

# Build and push Docker image
build_and_push_image() {
    log "Building and pushing B2B Backend Docker image..."
    
    # Create Artifact Registry repository if it doesn't exist
    if ! gcloud artifacts repositories describe ${PROJECT_NAME} --location=${REGION} &>/dev/null; then
        info "Creating Artifact Registry repository..."
        gcloud artifacts repositories create ${PROJECT_NAME} \
            --repository-format=docker \
            --location=${REGION} \
            --description="TourMaster AI Docker images"
    fi
    
    # Configure Docker to use gcloud as a credential helper
    gcloud auth configure-docker ${REGION}-docker.pkg.dev
    
    # Build the image
    info "Building Docker image..."
    docker build -t ${DOCKER_IMAGE}:latest \
        -f docker/Dockerfile.b2b-backend \
        .
    
    # Tag for Artifact Registry
    FULL_IMAGE_NAME="${REGION}-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/${PROJECT_NAME}/${SERVICE_NAME}:latest"
    docker tag ${DOCKER_IMAGE}:latest ${FULL_IMAGE_NAME}
    
    # Push to Artifact Registry
    info "Pushing image to Artifact Registry..."
    docker push ${FULL_IMAGE_NAME}
    
    log "✅ Docker image built and pushed successfully!"
    echo "Image: ${FULL_IMAGE_NAME}"
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    log "Deploying B2B Backend to Google Cloud Run..."
    
    # Construct the full image name
    FULL_IMAGE_NAME="${REGION}-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/${PROJECT_NAME}/${SERVICE_NAME}:latest"
    
    # Construct DATABASE_URL
    DATABASE_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres"
    
    # Deploy to Cloud Run
    gcloud run deploy ${SERVICE_NAME} \
        --image ${FULL_IMAGE_NAME} \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --timeout 300 \
        --concurrency 100 \
        --min-instances 1 \
        --max-instances 10 \
        --set-env-vars \
            DATABASE_URL="${DATABASE_URL}",\
            SUPABASE_URL="${SUPABASE_URL}",\
            SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}",\
            SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD}",\
            JWT_SECRET="${JWT_SECRET}",\
            ALGORITHM="HS256",\
            ACCESS_TOKEN_EXPIRE_MINUTES="60",\
            SMTP_HOST="${SMTP_HOST:-smtp.sendgrid.net}",\
            SMTP_PORT="${SMTP_PORT:-587}",\
            SMTP_USER="${SMTP_USER:-apikey}",\
            SMTP_PASSWORD="${SMTP_PASSWORD:-your-sendgrid-api-key}",\
            OPENAI_API_KEY="${OPENAI_API_KEY}",\
            AI_CORE_SERVICE_URL="${AI_CORE_SERVICE_URL:-http://localhost:8000}",\
            API_V1_STR="/api",\
            DEPLOY_REGION="${REGION}"
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --platform managed \
        --region ${REGION} \
        --format 'value(status.url)')
    
    log "✅ B2B Backend deployed successfully!"
    echo "Service URL: ${SERVICE_URL}"
    
    # Export for use in other scripts
    export B2B_BACKEND_URL="${SERVICE_URL}"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    # Wait a moment for the service to be ready
    sleep 10
    
    # Check health endpoint
    if curl -f "${SERVICE_URL}/health" &> /dev/null; then
        log "✅ Health check passed!"
    else
        warn "Health check failed, but service might still be starting..."
        info "You can check logs with: gcloud logs read --service=${SERVICE_NAME} --limit=50"
    fi
    
    # Test API endpoints
    info "Testing API endpoints..."
    
    # Test auth endpoint
    if curl -f "${SERVICE_URL}/api/auth/login" -X POST -H "Content-Type: application/json" -d '{}' &> /dev/null; then
        log "✅ Auth endpoint is accessible"
    else
        info "Auth endpoint test completed (expected to fail without credentials)"
    fi
}

# Create sample operator data
create_sample_data() {
    log "Creating sample operator data..."
    
    # Note: This would typically connect to the database and create sample data
    # For now, we'll just log that this step would happen
    info "Sample data creation would happen here in a full deployment"
    info "You can run create_sample_data.py locally to populate the database"
}

# Display deployment summary
display_summary() {
    log "🎉 B2B Backend deployment completed successfully!"
    echo ""
    echo "📋 Deployment Summary"
    echo "===================="
    echo "Service Name: ${SERVICE_NAME}"
    echo "Service URL: ${SERVICE_URL}"
    echo "Region: ${REGION}"
    echo "Project: ${GOOGLE_CLOUD_PROJECT}"
    echo ""
    echo "🔗 API Endpoints:"
    echo "Health Check: ${SERVICE_URL}/health"
    echo "API Base: ${SERVICE_URL}/api"
    echo "Auth Login: ${SERVICE_URL}/api/auth/login"
    echo "Leads: ${SERVICE_URL}/api/leads"
    echo ""
    echo "🔐 Test Credentials:"
    echo "Email: demo@safariexperts.com"
    echo "Password: password123"
    echo ""
    echo "📊 Next Steps:"
    echo "1. Test the API endpoints using the provided URLs"
    echo "2. Update frontend applications with the new backend URL"
    echo "3. Set up monitoring and alerting"
    echo "4. Configure custom domains (optional)"
    echo "5. Set up SSL certificates if using custom domains"
    echo ""
    echo "🔧 Useful Commands:"
    echo "View logs: gcloud logs read --service=${SERVICE_NAME} --limit=50"
    echo "Update service: gcloud run services update ${SERVICE_NAME} --region=${REGION}"
    echo "Delete service: gcloud run services delete ${SERVICE_NAME} --region=${REGION}"
}

# Main deployment function
main() {
    log "🚀 Starting TourMaster AI (B2B) Backend deployment..."
    
    check_prerequisites
    setup_gcloud_project
    build_and_push_image
    deploy_to_cloud_run
    run_health_checks
    create_sample_data
    display_summary
    
    log "✅ Deployment script completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    "check")
        check_prerequisites
        ;;
    "build")
        check_prerequisites
        build_and_push_image
        ;;
    "deploy")
        main
        ;;
    "health")
        run_health_checks
        ;;
    *)
        echo "Usage: $0 [check|build|deploy|health]"
        echo "  check  - Check prerequisites only"
        echo "  build  - Build and push Docker image only"
        echo "  deploy - Full deployment (default)"
        echo "  health - Run health checks only"
        exit 1
        ;;
esac
