#!/bin/bash

# SafiriSmart Deployment Helper Script
# This script assists with deploying various backend services

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

log_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

log_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing=0
    
    # Check Node.js and npm
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install from https://nodejs.org/"
        ((missing++))
    else
        log_success "Node.js installed: $(node --version)"
    fi
    
    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        log_warning "Supabase CLI not found. Install with: npm install -g supabase"
        ((missing++))
    else
        log_success "Supabase CLI installed: $(supabase --version)"
    fi
    
    # Check Docker (optional)
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not found. Required for deploying FastAPI services."
    else
        log_success "Docker installed: $(docker --version)"
    fi
    
    # Check gcloud (optional)
    if ! command -v gcloud &> /dev/null; then
        log_warning "Google Cloud CLI not found. Required for Cloud Run deployment."
    else
        log_success "Google Cloud CLI installed: $(gcloud --version | head -1)"
    fi
    
    if [ $missing -gt 0 ]; then
        log_error "Missing $missing prerequisite(s). Please install and try again."
        return 1
    fi
    
    log_success "All prerequisites satisfied!"
    return 0
}

# Deploy Supabase Edge Functions
deploy_supabase_functions() {
    log_info "Deploying Supabase Edge Functions..."
    
    # Check if already linked
    if [ ! -f ".supabase/config.json" ]; then
        log_info "Linking to Supabase project..."
        supabase link --project-ref kwmohdwibtxlspfqarje
    fi
    
    # Deploy functions
    log_info "Deploying all edge functions..."
    supabase functions deploy
    
    log_success "Supabase Edge Functions deployed!"
    
    # List deployed functions
    log_info "Deployed functions:"
    supabase functions list
}

# Deploy to Google Cloud Run
deploy_to_cloud_run() {
    local service_name=$1
    local region=${2:-us-central1}
    local dockerfile=${3:-Dockerfile}
    
    log_info "Deploying $service_name to Google Cloud Run..."
    
    # Check gcloud
    if ! command -v gcloud &> /dev/null; then
        log_error "Google Cloud CLI not installed. Install from https://cloud.google.com/sdk/docs/install"
        return 1
    fi
    
    # Get project ID
    local project_id=$(gcloud config get-value project)
    if [ -z "$project_id" ]; then
        log_error "Google Cloud project not configured. Run: gcloud config set project YOUR_PROJECT_ID"
        return 1
    fi
    
    log_info "Using Google Cloud Project: $project_id"
    
    local image_name="gcr.io/$project_id/$service_name"
    
    # Build Docker image
    log_info "Building Docker image..."
    docker build -t $image_name:latest -f $dockerfile .
    
    # Push to registry
    log_info "Pushing to Google Container Registry..."
    gcloud auth configure-docker
    docker push $image_name:latest
    
    # Deploy to Cloud Run
    log_info "Deploying to Cloud Run..."
    gcloud run deploy $service_name \
        --image $image_name:latest \
        --platform managed \
        --region $region \
        --allow-unauthenticated \
        --memory 1Gi \
        --cpu 1 \
        --timeout 300
    
    log_success "Deployed to Google Cloud Run!"
    
    # Get service URL
    local service_url=$(gcloud run services describe $service_name --region=$region --format='value(status.url)')
    log_info "Service URL: $service_url"
}

# Test Supabase functions locally
test_functions_local() {
    log_info "Starting local Supabase functions server..."
    
    log_info "Serving functions on http://localhost:54321/functions/v1/"
    supabase functions serve --env-file .env.local
}

# Show deployment status
deployment_status() {
    log_info "Checking deployment status..."
    
    echo ""
    log_info "Supabase Functions:"
    supabase functions list 2>/dev/null || log_error "Not linked to Supabase"
    
    echo ""
    log_info "Cloud Run Services:"
    if command -v gcloud &> /dev/null; then
        gcloud run services list
    else
        log_warning "Google Cloud CLI not installed"
    fi
}

# Display help
show_help() {
    cat << 'EOF'
SafiriSmart Deployment Helper

Usage: ./deploy.sh [COMMAND] [OPTIONS]

Commands:
    check               Check prerequisites for deployment
    supabase-deploy     Deploy Supabase Edge Functions
    supabase-test       Test functions locally
    cloud-run           Deploy to Google Cloud Run
    status              Show deployment status
    help                Show this help message

Examples:
    ./deploy.sh check                    # Verify all prerequisites
    ./deploy.sh supabase-deploy          # Deploy edge functions
    ./deploy.sh supabase-test            # Run functions locally
    ./deploy.sh status                   # Check current deployments

Environment Variables:
    SUPABASE_PROJECT_ID  Supabase project ID (default: kwmohdwibtxlspfqarje)
    GOOGLE_CLOUD_PROJECT Google Cloud project ID (for Cloud Run)

For more information, see: DEPLOYMENT_GUIDE.md
EOF
}

# Main script logic
main() {
    local command=${1:-help}
    
    case $command in
        check)
            check_prerequisites
            ;;
        supabase-deploy)
            check_prerequisites || exit 1
            deploy_supabase_functions
            ;;
        supabase-test)
            check_prerequisites || exit 1
            test_functions_local
            ;;
        cloud-run)
            check_prerequisites || exit 1
            local service_name=${2:-my-service}
            local region=${3:-us-central1}
            deploy_to_cloud_run $service_name $region
            ;;
        status)
            deployment_status
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
