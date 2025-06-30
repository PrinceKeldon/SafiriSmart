
# Core AI Service Deployment Guide

## Prerequisites

1. **Google Cloud Setup**
   ```bash
   # Install Google Cloud CLI if not already installed
   # Visit: https://cloud.google.com/sdk/docs/install
   
   # Authenticate with Google Cloud
   gcloud auth login
   
   # Set your project ID (replace with your actual project ID)
   export GOOGLE_CLOUD_PROJECT="your-project-id"
   gcloud config set project $GOOGLE_CLOUD_PROJECT
   
   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

2. **Environment Variables**
   ```bash
   # Set your OpenAI API key
   export OPENAI_API_KEY="your-openai-api-key-here"
   
   # Optional: Set custom region (default: us-central1)
   export DEPLOY_REGION="us-central1"
   ```

## Deployment Steps

### Option 1: Using the Deployment Script (Recommended)

1. **Make the script executable**
   ```bash
   chmod +x scripts/deploy-ai-core.sh
   ```

2. **Run the deployment**
   ```bash
   ./scripts/deploy-ai-core.sh
   ```

### Option 2: Manual Deployment

1. **Build the Docker image**
   ```bash
   docker build -t gcr.io/$GOOGLE_CLOUD_PROJECT/ai-core-service:latest \
     -f docker/Dockerfile.ai-core \
     ./ai-core-service/
   ```

2. **Push to Google Container Registry**
   ```bash
   gcloud auth configure-docker
   docker push gcr.io/$GOOGLE_CLOUD_PROJECT/ai-core-service:latest
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy ai-core-service \
     --image gcr.io/$GOOGLE_CLOUD_PROJECT/ai-core-service:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars OPENAI_API_KEY=$OPENAI_API_KEY \
     --set-env-vars API_V1_STR=/api \
     --memory 1Gi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10 \
     --timeout 300 \
     --port 8000
   ```

## Verification

1. **Get the service URL**
   ```bash
   gcloud run services describe ai-core-service \
     --platform managed \
     --region us-central1 \
     --format 'value(status.url)'
   ```

2. **Test the health endpoint**
   ```bash
   curl $(gcloud run services describe ai-core-service --region=us-central1 --format 'value(status.url)')/health
   ```

3. **Test itinerary generation**
   ```bash
   curl -X POST \
     $(gcloud run services describe ai-core-service --region=us-central1 --format 'value(status.url)')/generate_itinerary \
     -H "Content-Type: application/json" \
     -d '{
       "duration_days": 5,
       "budget_range": "mid-range",
       "group_size": 2,
       "interests": ["wildlife", "photography"],
       "pace": "relaxed"
     }'
   ```

## Troubleshooting

1. **View logs**
   ```bash
   gcloud run logs tail ai-core-service --region=us-central1
   ```

2. **Check service status**
   ```bash
   gcloud run services describe ai-core-service --region=us-central1
   ```

3. **Update service (after code changes)**
   ```bash
   # Rebuild and redeploy
   ./scripts/deploy-ai-core.sh
   ```

## Cost Optimization

- The service is configured with:
  - **Min instances**: 0 (scales to zero when not in use)
  - **Max instances**: 10 (prevents runaway costs)
  - **Memory**: 1Gi (sufficient for AI processing)
  - **CPU**: 1 (adequate for single requests)
  - **Timeout**: 300s (allows for longer AI processing)

## Security Notes

- The service is deployed with `--allow-unauthenticated` for MVP purposes
- For production, consider adding authentication
- Environment variables are securely managed by Cloud Run
- The service runs as a non-root user inside the container

## Next Steps

After successful deployment:
1. Note the service URL from the deployment output
2. Proceed with Phase 1.2: TourMaster AI (B2B) Backend Deployment
3. Update the B2B backend's `AI_CORE_SERVICE_URL` environment variable
