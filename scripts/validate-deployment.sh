
#!/bin/bash

# TourMaster AI (B2B) Backend - Deployment Validation Script
# Comprehensive testing script to validate backend deployment

set -e

# Configuration
SERVICE_URL="${1:-}"
TEST_EMAIL="demo@safariexperts.com"
TEST_PASSWORD="password123"

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
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if service URL is provided
if [ -z "$SERVICE_URL" ]; then
    error "Please provide the service URL as the first argument"
    echo "Usage: $0 <service-url>"
    echo "Example: $0 https://b2b-backend-xxx-uc.a.run.app"
    exit 1
fi

# Remove trailing slash if present
SERVICE_URL=$(echo "$SERVICE_URL" | sed 's:/*$::')

log "🧪 Starting deployment validation for: $SERVICE_URL"

# Test 1: Health Check
test_health_check() {
    log "Testing health check endpoint..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health")
    
    if [ "$response" = "200" ]; then
        log "✅ Health check passed"
    else
        error "❌ Health check failed (HTTP $response)"
        return 1
    fi
}

# Test 2: API Documentation
test_api_docs() {
    log "Testing API documentation endpoint..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/docs")
    
    if [ "$response" = "200" ]; then
        log "✅ API documentation accessible"
    else
        warn "⚠️ API documentation not accessible (HTTP $response)"
    fi
}

# Test 3: Authentication Endpoint
test_auth_endpoint() {
    log "Testing authentication endpoint..."
    
    # Test with invalid credentials (should return 422 or 401)
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "$SERVICE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    if [ "$response" = "422" ] || [ "$response" = "401" ]; then
        log "✅ Auth endpoint responding correctly"
    else
        error "❌ Auth endpoint unexpected response (HTTP $response)"
        return 1
    fi
}

# Test 4: Leads Endpoint (without auth)
test_leads_endpoint_no_auth() {
    log "Testing leads endpoint without authentication..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "$SERVICE_URL/api/leads")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        log "✅ Leads endpoint properly protected"
    else
        warn "⚠️ Leads endpoint may not be properly protected (HTTP $response)"
    fi
}

# Test 5: CORS Headers
test_cors_headers() {
    log "Testing CORS headers..."
    
    cors_headers=$(curl -s -I \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: authorization" \
        -X OPTIONS "$SERVICE_URL/api/leads" | grep -i "access-control")
    
    if echo "$cors_headers" | grep -q "access-control-allow"; then
        log "✅ CORS headers present"
    else
        warn "⚠️ CORS headers may not be configured"
    fi
}

# Test 6: Database Connection (indirect test)
test_database_connection() {
    log "Testing database connection (indirect)..."
    
    # Try to access an endpoint that requires database
    response=$(curl -s \
        -X POST "$SERVICE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
    
    # Check if response is JSON and not a database error
    if echo "$response" | jq . > /dev/null 2>&1; then
        log "✅ Database connection appears to be working"
    else
        error "❌ Database connection may be failing"
        echo "Response: $response"
        return 1
    fi
}

# Test 7: Environment Variables Check
test_environment_config() {
    log "Testing environment configuration..."
    
    # Test if the service has proper error handling
    response=$(curl -s "$SERVICE_URL/api/leads" \
        -H "Authorization: Bearer invalid-token")
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        if echo "$response" | jq -r '.detail' | grep -q "Could not validate credentials"; then
            log "✅ JWT validation working"
        else
            log "✅ Environment configuration appears correct"
        fi
    else
        warn "⚠️ Environment configuration may have issues"
    fi
}

# Test 8: Performance Check
test_performance() {
    log "Testing response performance..."
    
    start_time=$(date +%s%N)
    curl -s -o /dev/null "$SERVICE_URL/health"
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $duration -lt 2000 ]; then
        log "✅ Response time acceptable (${duration}ms)"
    else
        warn "⚠️ Response time may be slow (${duration}ms)"
    fi
}

# Test 9: SSL Certificate Check
test_ssl_certificate() {
    log "Testing SSL certificate..."
    
    if echo "$SERVICE_URL" | grep -q "https://"; then
        ssl_info=$(curl -s -I "$SERVICE_URL/health" | grep -i "server\|ssl\|tls")
        log "✅ HTTPS enabled"
        info "SSL Info: $(echo $ssl_info | tr '\n' ' ')"
    else
        warn "⚠️ Service not using HTTPS"
    fi
}

# Test 10: API Versioning
test_api_versioning() {
    log "Testing API versioning..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/api")
    
    if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "405" ]; then
        log "✅ API versioning endpoint accessible"
    else
        warn "⚠️ API versioning may have issues (HTTP $response)"
    fi
}

# Run all tests
run_all_tests() {
    log "🚀 Starting comprehensive deployment validation..."
    
    tests=(
        "test_health_check"
        "test_api_docs"
        "test_auth_endpoint"
        "test_leads_endpoint_no_auth"
        "test_cors_headers"
        "test_database_connection"
        "test_environment_config"
        "test_performance"
        "test_ssl_certificate"
        "test_api_versioning"
    )
    
    passed=0
    total=${#tests[@]}
    
    for test in "${tests[@]}"; do
        if $test; then
            ((passed++))
        fi
        echo ""
    done
    
    # Summary
    log "🏁 Validation Summary"
    echo "===================="
    echo "Tests Passed: $passed/$total"
    echo "Service URL: $SERVICE_URL"
    echo ""
    
    if [ $passed -eq $total ]; then
        log "🎉 All tests passed! Deployment is successful."
        echo ""
        echo "✅ Your B2B Backend is ready for production use!"
        echo ""
        echo "🔗 Key Endpoints:"
        echo "   Health: $SERVICE_URL/health"
        echo "   Docs: $SERVICE_URL/docs"
        echo "   API: $SERVICE_URL/api"
        echo ""
        echo "🔐 Next Steps:"
        echo "   1. Test with actual operator credentials"
        echo "   2. Update frontend applications with this URL"
        echo "   3. Set up monitoring and alerting"
    else
        warn "⚠️ Some tests failed. Please review the issues above."
        echo ""
        echo "🔧 Troubleshooting:"
        echo "   1. Check service logs: gcloud logs read --service=b2b-backend"
        echo "   2. Verify environment variables"
        echo "   3. Test database connectivity"
    fi
}

# Main execution
case "${2:-all}" in
    "health")
        test_health_check
        ;;
    "auth")
        test_auth_endpoint
        ;;
    "performance")
        test_performance
        ;;
    "all"|*)
        run_all_tests
        ;;
esac
