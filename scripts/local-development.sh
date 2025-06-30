
#!/bin/bash

# Tourism Concierge AI - Local Development Setup with Supabase
# This script sets up the local development environment using Supabase as the database

set -e

echo "🚀 Setting up Tourism Concierge AI for local development with Supabase..."

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
    log "📋 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is not installed. Please install Python 3 first."
    fi
    
    log "✅ Prerequisites check passed!"
}

# Setup environment variables
setup_environment() {
    log "🔧 Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        log "📝 Creating .env file from template..."
        cp .env.example .env
        warn "Please update .env file with your actual values:"
        echo "   - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard)"
        echo "   - SUPABASE_DB_PASSWORD (from Supabase dashboard)"
        echo "   - OPENAI_API_KEY (for AI functionality)"
        echo "   - SMTP credentials (for email notifications)"
        echo ""
        read -p "Press enter after updating .env file..."
    fi
    
    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)
    
    # Validate required variables
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        error "SUPABASE_SERVICE_ROLE_KEY not set in .env file"
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        warn "OPENAI_API_KEY not set - AI features will not work"
    fi
}

# Test Supabase connection
test_supabase_connection() {
    log "🗄️ Testing Supabase connection..."
    
    # Test database connection
    python3 -c "
import sys
sys.path.append('config')
from database import check_db_connection
if check_db_connection():
    print('✅ Supabase database connection successful')
else:
    print('❌ Supabase database connection failed')
    sys.exit(1)
" || error "Failed to connect to Supabase database"
}

# Setup backend services
setup_backend_services() {
    log "🔧 Setting up backend services..."
    
    # AI Core Service
    if [ -d "ai-core-service" ]; then
        log "🤖 Setting up AI Core Service..."
        cd ai-core-service
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
    fi
    
    # B2B Backend
    if [ -d "b2b-backend" ]; then
        log "🏢 Setting up B2B Backend..."
        cd b2b-backend
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
    fi
}

# Setup frontend applications
setup_frontend_applications() {
    log "🎨 Setting up frontend applications..."
    
    # B2C Frontend
    if [ -d "b2c-frontend" ]; then
        log "🌐 Setting up B2C Frontend..."
        cd b2c-frontend
        npm install
        
        # Create local environment file
        cat > .env.local << EOF
VITE_API_URL=http://localhost:8001/api
VITE_SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHV4Z2poZWF5d2Z3cnBjdGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODM3ODQsImV4cCI6MjA2Njg1OTc4NH0.UrqW99pZe9X7maAcXlw5EdKX445CRngOkAAn13b4euQ
EOF
        cd ..
    fi
    
    # B2B Dashboard
    if [ -d "b2b-dashboard" ]; then
        log "📊 Setting up B2B Dashboard..."
        cd b2b-dashboard
        npm install
        
        # Create local environment file
        cat > .env.local << EOF
VITE_API_URL=http://localhost:8001/api
EOF
        cd ..
    fi
}

# Start development services
start_development_services() {
    log "🚀 Starting development services..."
    
    # Start backend services with Docker Compose
    log "Starting backend services..."
    docker-compose -f docker/docker-compose.supabase.yml up -d
    
    # Wait for services to be ready
    log "⏳ Waiting for services to start..."
    sleep 20
    
    # Health checks
    log "🔍 Performing health checks..."
    
    # Check AI Core Service
    for i in {1..5}; do
        if curl -f http://localhost:8000/health &>/dev/null; then
            log "✅ AI Core Service is healthy"
            break
        elif [ $i -eq 5 ]; then
            error "AI Core Service health check failed after 5 attempts"
        else
            log "Attempt $i: AI Core Service not ready, waiting..."
            sleep 10
        fi
    done
    
    # Check B2B Backend
    for i in {1..5}; do
        if curl -f http://localhost:8001/health &>/dev/null; then
            log "✅ B2B Backend is healthy"
            break
        elif [ $i -eq 5 ]; then
            error "B2B Backend health check failed after 5 attempts"
        else
            log "Attempt $i: B2B Backend not ready, waiting..."
            sleep 10
        fi
    done
}

# Display success message
display_success_message() {
    log "🎉 Local development environment setup completed!"
    echo ""
    echo "🌐 Services Running:"
    echo "   - AI Core Service: http://localhost:8000"
    echo "   - B2B Backend API: http://localhost:8001"
    echo "   - API Documentation: http://localhost:8001/docs"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. 🎨 Start B2C Frontend: cd b2c-frontend && npm run dev"
    echo "2. 📊 Start B2B Dashboard: cd b2b-dashboard && npm run dev"
    echo ""
    echo "🔐 Test Login (B2B Dashboard):"
    echo "   Email: demo@safariexperts.com"
    echo "   Password: password123"
    echo ""
    echo "📊 Monitoring:"
    echo "   - Service logs: docker-compose -f docker/docker-compose.supabase.yml logs -f"
    echo "   - Supabase Dashboard: https://supabase.com/dashboard/project/gjhuxgjheaywfwrpctah"
    echo ""
    echo "🛑 To stop services: docker-compose -f docker/docker-compose.supabase.yml down"
}

# Main setup function
main() {
    log "🎯 Tourism Concierge AI - Local Development Setup (Supabase Integration)"
    echo "=============================================================================="
    
    check_prerequisites
    setup_environment
    test_supabase_connection
    setup_backend_services
    setup_frontend_applications
    start_development_services
    display_success_message
}

# Run main function
main "$@"
