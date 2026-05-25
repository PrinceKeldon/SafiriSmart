# SafiriSmart Backend Deployment Guide

## Overview

SafiriSmart has a hybrid backend architecture:

1. **Supabase Edge Functions** (TypeScript/Deno) - ✅ Primary backend (currently active)
2. **External FastAPI Services** (Python) - Optional scalable services
   - B2B Backend Service (Port 8001)
   - AI Core Service (Port 8000)

---

## Part 1: Deploy Supabase Edge Functions

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Supabase account with project: `kwmohdwibtxlspfqarje`
- GitHub access for authentication

### Deployment Steps

#### 1.1 Login to Supabase
```bash
cd ~/SafiriSmart
supabase login
# Follow the browser prompt to authenticate
```

#### 1.2 Link to Supabase Project
```bash
supabase link --project-ref kwmohdwibtxlspfqarje
# When asked for database password, provide your Supabase DB password
```

#### 1.3 Deploy Edge Functions
```bash
supabase functions deploy
# This deploys all functions in supabase/functions/ to the cloud
```

#### 1.4 Verify Deployment
```bash
# List deployed functions
supabase functions list

# Test a specific function
supabase functions invoke auth-login --local
```

### Available Edge Functions

| Function | Endpoint | Auth Required | Purpose |
|----------|----------|---|---------|
| `auth-login` | `/auth/login` | No | Operator login |
| `auth-me` | `/auth/me` | Yes | Get current operator |
| `operator-signup` | `/operator-signup` | No | Operator registration |
| `get-public-operators` | `/operators/public` | No | List operators |
| `create-lead` | `/leads` | No | Create new lead |
| `create-lead-with-operators` | `/leads/with-operators` | No | Create lead with operators |
| `update-lead` | `/leads/:id` | Yes | Update lead |
| `generate-description` | `/generate-description` | Yes | AI description |
| `send-email` | `/send-email` | No | Email service |

---

## Part 2: Deploy External FastAPI Services (Optional)

### Option A: Google Cloud Run (Recommended)

#### Prerequisites
- Google Cloud account and project
- Google Cloud CLI installed: `gcloud init`
- Docker installed and running
- Environment variables configured

#### 2A.1 Set Up Google Cloud

```bash
# Install Google Cloud CLI (macOS)
brew install google-cloud-sdk

# Authenticate
gcloud auth login

# Set project ID (replace with your GCP project)
export GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
gcloud config set project $GOOGLE_CLOUD_PROJECT

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 2A.2 Deploy B2B Backend Service

```bash
# Set environment variables
export SERVICE_NAME="tourmaster-b2b-backend"
export REGION="us-central1"
export IMAGE_NAME="gcr.io/$GOOGLE_CLOUD_PROJECT/$SERVICE_NAME"

# Build Docker image
docker build -t $IMAGE_NAME:latest -f docker/Dockerfile.b2b ./b2b-backend/

# Push to Google Container Registry
gcloud auth configure-docker
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=$SUPABASE_URL \
  --set-env-vars SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  --set-env-vars JWT_SECRET=$JWT_SECRET \
  --set-env-vars OPENAI_API_KEY=$OPENAI_API_KEY \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --port 8001
```

#### 2A.3 Deploy AI Core Service

```bash
# Set environment variables
export SERVICE_NAME="tourmaster-ai-core"
export REGION="us-central1"
export IMAGE_NAME="gcr.io/$GOOGLE_CLOUD_PROJECT/$SERVICE_NAME"

# Build and deploy (similar to B2B)
docker build -t $IMAGE_NAME:latest -f docker/Dockerfile.ai-core ./ai-core/
gcloud auth configure-docker
docker push $IMAGE_NAME:latest

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=$OPENAI_API_KEY \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --port 8000
```

### Option B: DigitalOcean App Platform

```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Deploy from GitHub
doctl apps create --spec app.yaml
```

### Option C: AWS ECS/Fargate

```bash
# Install AWS CLI
brew install awscli

# Configure
aws configure

# Deploy using CloudFormation or ECS CLI
# Refer to AWS documentation for detailed steps
```

---

## Part 3: Local Development Setup

### Run Services Locally

#### 3.1 Start Supabase Locally (Optional)
```bash
supabase start
# This starts local Supabase instance on port 54321
```

#### 3.2 Run Edge Functions Locally
```bash
supabase functions serve --env-file .env.local
# Functions available at http://localhost:54321/functions/v1/
```

#### 3.3 Run FastAPI Services Locally

**B2B Backend:**
```bash
cd b2b-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**AI Core Service:**
```bash
cd ai-core
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Part 4: Environment Variables Reference

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://kwmohdwibtxlspfqarje.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Production (Supabase Edge Functions)
VITE_B2B_BACKEND_URL=https://kwmohdwibtxlspfqarje.supabase.co/functions/v1
VITE_AI_CORE_SERVICE_URL=https://kwmohdwibtxlspfqarje.supabase.co/functions/v1

# Local Development (override above)
# VITE_B2B_BACKEND_URL=http://localhost:8001
# VITE_AI_CORE_SERVICE_URL=http://localhost:8000
```

### Backend Services
```env
# Supabase
SUPABASE_URL=https://kwmohdwibtxlspfqarje.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=your-db-password

# Security
JWT_SECRET=your-jwt-secret-key

# AI Services
OPENAI_API_KEY=sk-...

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# Google Cloud (if using)
GOOGLE_CLOUD_PROJECT=your-project-id
```

---

## Part 5: Deployment Checklist

### Before Deploying
- [ ] All secrets configured in environment
- [ ] Database migrations applied
- [ ] Tests passing locally
- [ ] Dockerfile tested locally
- [ ] API endpoints documented
- [ ] CORS configured properly

### After Deploying
- [ ] Test all API endpoints
- [ ] Check logs for errors: `gcloud run logs`
- [ ] Monitor performance metrics
- [ ] Update `.env.local` with new service URLs
- [ ] Test frontend integration
- [ ] Set up monitoring/alerts

---

## Part 6: Troubleshooting

### Supabase Functions Not Deploying
```bash
# Check authentication
supabase projects list

# Check function logs
supabase functions list --project-ref kwmohdwibtxlspfqarje
```

### Cloud Run Deployment Fails
```bash
# Check Docker build locally
docker build -t test-image:latest .

# Check Google Cloud authentication
gcloud auth list
gcloud config list

# View deployment logs
gcloud run logs read service-name --region=us-central1 --limit=50
```

### Environment Variables Not Found
```bash
# Verify secrets in Cloud Run
gcloud run services describe service-name --region=us-central1

# Set missing secrets
gcloud run deploy service-name \
  --update-env-vars KEY=VALUE \
  --region=us-central1
```

---

## Part 7: Monitoring & Maintenance

### View Function Invocations
```bash
# Supabase Edge Functions
supabase functions list

# Google Cloud Run
gcloud run services list
gcloud run logs read service-name
```

### Update Environment Variables
```bash
# Supabase Edge Functions
supabase secrets set OPENAI_API_KEY="new-key"

# Cloud Run
gcloud run deploy service-name \
  --update-env-vars OPENAI_API_KEY="new-key" \
  --region=us-central1
```

### Rollback Deployment
```bash
# Cloud Run (revisions)
gcloud run services update-traffic service-name \
  --to-revisions REVISION_NAME=100 \
  --region=us-central1
```

---

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
