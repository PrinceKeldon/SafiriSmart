
# TourMaster AI (B2B) Backend Deployment Guide

This guide provides step-by-step instructions for deploying the TourMaster AI B2B Backend to Google Cloud Run.

## Prerequisites

### 1. Required Tools
- Docker Desktop installed and running
- Google Cloud CLI (gcloud) installed and configured
- Git (for cloning and version control)

### 2. Google Cloud Setup
```bash
# Install Google Cloud CLI (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project (replace with your actual project ID)
gcloud config set project your-project-id

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

### 3. Environment Variables
Ensure these environment variables are set in your deployment environment:

**Required Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for backend operations
- `SUPABASE_DB_PASSWORD` - Database password for direct PostgreSQL connections
- `JWT_SECRET` - Secret key for JWT token generation
- `OPENAI_API_KEY` - OpenAI API key for AI-powered features
- `GOOGLE_CLOUD_PROJECT` - Your Google Cloud project ID

**Optional Variables:**
- `AI_CORE_SERVICE_URL` - URL of the AI Core Service (if deployed separately)
- `SMTP_HOST` - Email SMTP host (default: smtp.sendgrid.net)
- `SMTP_PORT` - Email SMTP port (default: 587)
- `SMTP_USER` - Email SMTP username (default: apikey)
- `SMTP_PASSWORD` - Email SMTP password/API key

## Deployment Steps

### Step 1: Prepare the Environment
```bash
# Clone the repository (if not already done)
git clone <your-repository-url>
cd tourmaster-ai

# Make the deployment script executable
chmod +x scripts/deploy-b2b-backend.sh

# Set required environment variables
export SUPABASE_URL="https://gjhuxgjheaywfwrpctah.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export SUPABASE_DB_PASSWORD="your-db-password"
export JWT_SECRET="your-jwt-secret"
export OPENAI_API_KEY="your-openai-api-key"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

### Step 2: Run Prerequisites Check
```bash
# Check if all prerequisites are met
./scripts/deploy-b2b-backend.sh check
```

### Step 3: Deploy the Backend
```bash
# Run the full deployment
./scripts/deploy-b2b-backend.sh deploy
```

This script will:
1. ✅ Check all prerequisites
2. 🐳 Build the Docker image
3. 📤 Push to Google Artifact Registry
4. 🚀 Deploy to Google Cloud Run
5. 🔍 Run health checks
6. 📊 Display deployment summary

### Step 4: Verify Deployment
After successful deployment, test these endpoints:

```bash
# Health check
curl https://your-service-url/health

# API documentation
curl https://your-service-url/docs

# Auth endpoint (should return 422 for empty body)
curl -X POST https://your-service-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Architecture Overview

### Database Integration
- **Primary Database**: Supabase PostgreSQL
- **Connection**: Direct PostgreSQL connection via DATABASE_URL
- **Security**: Row Level Security (RLS) policies for data protection
- **Migrations**: Automatic table creation on startup

### API Structure
```
/api/
├── auth/           # Authentication endpoints
│   ├── login       # Operator login
│   ├── logout      # Operator logout
│   └── me          # Current operator info
├── leads/          # Lead management
│   ├── GET /       # List leads (paginated)
│   ├── POST /      # Create new lead
│   ├── GET /{id}   # Get lead details
│   ├── PUT /{id}   # Update lead
│   └── DELETE /{id} # Delete lead
├── operators/      # Operator management
└── packages/       # Package management
```

### Authentication Flow
1. **Login**: POST /api/auth/login with email/password
2. **Token**: Receive JWT access token
3. **Authorization**: Include token in Authorization header
4. **Validation**: Token validated on each protected endpoint

## Environment Configuration

### Production Environment Variables
The deployment automatically configures these environment variables:

```bash
DATABASE_URL=postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres
SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
JWT_SECRET=${JWT_SECRET}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=${OPENAI_API_KEY}
AI_CORE_SERVICE_URL=${AI_CORE_SERVICE_URL}
API_V1_STR=/api
```

### Resource Configuration
- **Memory**: 2GB
- **CPU**: 2 vCPU
- **Timeout**: 300 seconds
- **Concurrency**: 100 requests per instance
- **Scaling**: 1-10 instances

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check Docker is running
docker info

# Verify Dockerfile syntax
docker build -t test -f docker/Dockerfile.b2b-backend .
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
python -c "
import psycopg2
conn = psycopg2.connect('postgresql://postgres:password@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres')
print('Database connection successful!')
conn.close()
"
```

#### 3. Authentication Problems
- Verify JWT_SECRET is properly set
- Check operator accounts exist in database
- Validate password hashing

#### 4. Service Startup Issues
```bash
# View service logs
gcloud logs read --service=b2b-backend --limit=50

# Check service status
gcloud run services describe b2b-backend --region=us-central1
```

### Log Analysis
```bash
# Real-time logs
gcloud logs tail --service=b2b-backend

# Filter error logs
gcloud logs read --service=b2b-backend --filter="severity>=ERROR"

# Filter by timestamp
gcloud logs read --service=b2b-backend \
  --filter="timestamp>=\"2024-01-01T00:00:00Z\""
```

## Security Considerations

### 1. Database Security
- Row Level Security (RLS) enabled on all tables
- Service role key used for backend operations
- Connection encrypted with SSL

### 2. API Security
- JWT-based authentication
- HTTPS-only communication
- CORS configured for frontend domains

### 3. Secrets Management
- Environment variables for sensitive data
- No secrets in Docker images or code
- Google Cloud Secret Manager integration (optional)

## Monitoring and Maintenance

### 1. Health Monitoring
- Built-in health check endpoint: `/health`
- Automatic container health checks
- Google Cloud Monitoring integration

### 2. Performance Monitoring
```bash
# View performance metrics
gcloud run services describe b2b-backend \
  --region=us-central1 \
  --format="export"
```

### 3. Updates and Rollbacks
```bash
# Deploy new version
./scripts/deploy-b2b-backend.sh deploy

# Rollback to previous version
gcloud run services update b2b-backend \
  --image=previous-image-url \
  --region=us-central1
```

## Next Steps

1. **Frontend Integration**: Update frontend applications with the deployed backend URL
2. **Custom Domain**: Configure custom domain and SSL certificates
3. **Monitoring**: Set up alerts and monitoring dashboards
4. **CI/CD**: Implement automated deployment pipelines
5. **Scaling**: Monitor performance and adjust resource allocation

## Support

For deployment issues:
1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Ensure database connectivity from your deployment environment
4. Review the deployment script output for specific error messages

---

**Deployment Complete!** Your TourMaster AI B2B Backend is now running on Google Cloud Run and ready to serve API requests.
