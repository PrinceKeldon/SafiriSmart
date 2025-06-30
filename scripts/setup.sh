
#!/bin/bash

# Tourism Concierge AI - Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Tourism Concierge AI Product Suite..."

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    echo "✅ Prerequisites check passed!"
}

# Setup environment variables
setup_environment() {
    echo "🔧 Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
        echo "⚠️  Please update .env file with your actual values before proceeding."
        echo "   Required: SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY"
        read -p "Press enter after updating .env file..."
    fi
    
    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)
}

# Setup Supabase
setup_supabase() {
    echo "🗄️  Setting up Supabase..."
    
    if [ -z "$SUPABASE_URL" ]; then
        echo "❌ SUPABASE_URL not set in .env file"
        exit 1
    fi
    
    echo "📊 Creating database schema..."
    # Run Supabase migrations (assumes Supabase CLI is installed)
    if command -v supabase &> /dev/null; then
        supabase db reset
        supabase db push
    else
        echo "⚠️  Supabase CLI not found. Please run the SQL migrations manually in your Supabase dashboard."
        echo "   Migration files are in: docs/supabase-migration-guide.md"
    fi
}

# Setup backend services
setup_backend() {
    echo "🔧 Setting up backend services..."
    
    # AI Core Service
    echo "🤖 Setting up AI Core Service..."
    cd ai-core-service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    
    # B2B Backend
    echo "🏢 Setting up B2B Backend..."
    cd b2b-backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Create sample data
    echo "📝 Creating sample operator data..."
    python create_sample_data.py
    cd ..
}

# Setup frontend applications
setup_frontend() {
    echo "🎨 Setting up frontend applications..."
    
    # B2C Frontend
    echo "🌐 Setting up B2C Frontend..."
    cd b2c-frontend
    npm install
    cd ..
    
    # B2B Dashboard
    echo "📊 Setting up B2B Dashboard..."
    cd b2b-dashboard
    npm install
    cd ..
}

# Build Docker images
build_docker() {
    echo "🐳 Building Docker images..."
    
    # Build AI Core Service
    echo "Building AI Core Service..."
    docker build -t tourism-ai/ai-core:latest ./ai-core-service
    
    # Build B2B Backend
    echo "Building B2B Backend..."
    docker build -t tourism-ai/b2b-backend:latest ./b2b-backend
    
    echo "✅ Docker images built successfully!"
}

# Start development environment
start_development() {
    echo "🚀 Starting development environment..."
    
    # Start backend services with Docker Compose
    echo "Starting backend services..."
    docker-compose -f deploy/docker-compose.yml up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Health check
    echo "🔍 Performing health checks..."
    curl -f http://localhost:8000/health || echo "⚠️  AI Core Service health check failed"
    curl -f http://localhost:8001/health || echo "⚠️  B2B Backend health check failed"
    
    echo "✅ Backend services are running!"
    echo "🌐 AI Core Service: http://localhost:8000"
    echo "🏢 B2B Backend API: http://localhost:8001"
    echo "📖 API Documentation: http://localhost:8001/docs"
}

# Main setup flow
main() {
    echo "🎯 Tourism Concierge AI - Complete Setup"
    echo "========================================"
    
    check_prerequisites
    setup_environment
    setup_supabase
    setup_backend
    setup_frontend
    build_docker
    start_development
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next Steps:"
    echo "1. 🎨 Start B2C Frontend: cd b2c-frontend && npm run dev"
    echo "2. 📊 Start B2B Dashboard: cd b2b-dashboard && npm run dev"
    echo "3. 🌐 Access applications:"
    echo "   - B2C Frontend: http://localhost:5173"
    echo "   - B2B Dashboard: http://localhost:5174"
    echo "   - API Documentation: http://localhost:8001/docs"
    echo ""
    echo "🔐 Test Login (B2B Dashboard):"
    echo "   Email: demo@safariexperts.com"
    echo "   Password: password123"
    echo ""
    echo "📚 Documentation: ./docs/"
    echo "🐛 Logs: docker-compose -f deploy/docker-compose.yml logs -f"
}

# Run main function
main "$@"
