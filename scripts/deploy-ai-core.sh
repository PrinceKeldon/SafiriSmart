
#!/bin/bash

# Core AI Service Deployment Script for Google Cloud Run

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"tourism-concierge-ai"}
REGION=${DEPLOY_REGION:-"us-central1"}
SERVICE_NAME="ai-core-service"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

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
    if [ -z "${OPENAI_API_KEY}" ]; then
        error "OPENAI_API_KEY environment variable is not set!"
    fi
    
    # Check if gcloud is installed and authenticated
    if ! command -v gcloud &> /dev/null; then
        error "Google Cloud CLI (gcloud) is not installed!"
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed!"
    fi
    
    # Check if user is authenticated with gcloud
    if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" | grep -q .; then
        error "Please authenticate with Google Cloud: gcloud auth login"
    fi
    
    log "✅ Prerequisites check passed!"
}

# Build Docker image
build_image() {
    log "Building Docker image for Core AI Service..."
    
    # Navigate to ai-core-service directory
    if [ ! -d "ai-core-service" ]; then
        error "ai-core-service directory not found! Please run this script from the project root."
    fi
    
    # Build the image
    docker build -t ${IMAGE_NAME}:latest \
        -f docker/Dockerfile.ai-core \
        ./ai-core-service/
    
    log "✅ Docker image built successfully!"
}

# Push image to Google Container Registry
push_image() {
    log "Pushing image to Google Container Registry..."
    
    # Configure Docker to use gcloud as a credential helper
    gcloud auth configure-docker --quiet
    
    # Push the image
    docker push ${IMAGE_NAME}:latest
    
    log "✅ Image pushed to GCR successfully!"
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    log "Deploying Core AI Service to Google Cloud Run..."
    
    # Set the project
    gcloud config set project ${PROJECT_ID}
    
    # Deploy the service
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --set-env-vars OPENAI_API_KEY=${OPENAI_API_KEY} \
        --set-env-vars API_V1_STR=/api \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 300 \
        --port 8000
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --platform managed \
        --region ${REGION} \
        --format 'value(status.url)')
    
    log "✅ Core AI Service deployed successfully!"
    log "Service URL: ${SERVICE_URL}"
    
    # Export the URL for use in other services
    echo "AI_CORE_SERVICE_URL=${SERVICE_URL}" > .env.ai-core
    
    return 0
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --platform managed \
        --region ${REGION} \
        --format 'value(status.url)')
    
    # Wait a moment for the service to be ready
    sleep 10
    
    # Check health endpoint
    if curl -f "${SERVICE_URL}/health" &> /dev/null; then
        log "✅ Health check passed!"
    else
        warn "Health check failed. Service might still be starting up."
        log "You can check the service status with:"
        log "gcloud run services describe ${SERVICE_NAME} --region=${REGION}"
    fi
}

# Main deployment function
main() {
    log "🚀 Starting Core AI Service deployment to Google Cloud Run..."
    
    check_prerequisites
    build_image
    push_image
    deploy_to_cloud_run
    health_check
    
    log "🎉 Core AI Service deployment completed!"
    echo ""
    echo "📋 Deployment Summary"
    echo "===================="
    echo "Service Name: ${SERVICE_NAME}"
    echo "Project ID: ${PROJECT_ID}"
    echo "Region: ${REGION}"
    echo "Service URL: $(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format 'value(status.url)')"
    echo ""
    echo "🔧 Management Commands:"
    echo "  View logs: gcloud run logs tail ${SERVICE_NAME} --region=${REGION}"
    echo "  View service: gcloud run services describe ${SERVICE_NAME} --region=${REGION}"
    echo "  Update service: ./scripts/deploy-ai-core.sh"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Test the service: curl \$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format 'value(status.url)')/health"
    echo "2. Deploy the B2B Backend service"
    echo "3. Update frontend environment variables"
}

# Run main function
main "$@"
