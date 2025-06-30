
# Tourism Concierge AI - Final Integration and Deployment Plan

## Overview
This document outlines the complete integration and deployment strategy for the Tourism Concierge AI Product Suite, leveraging Supabase as the primary backend infrastructure.

## 1. Environment Setup (Supabase-centric)

### 1.1 Supabase Project Setup
1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com) and create a new project
   - Choose region closest to your target users
   - Note down project URL and API keys (anon and service_role)

2. **Database Schema Migration**
   ```sql
   -- Create operators table
   CREATE TABLE operators (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     company VARCHAR(255) NOT NULL,
     specializations TEXT[],
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   -- Create leads table
   CREATE TABLE leads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     status VARCHAR(20) NOT NULL DEFAULT 'new',
     assigned_operator_id UUID REFERENCES operators(id),
     traveler_name VARCHAR(255) NOT NULL,
     traveler_email VARCHAR(255) NOT NULL,
     traveler_phone VARCHAR(50),
     traveler_country VARCHAR(100),
     preferences JSONB NOT NULL,
     itinerary JSONB,
     quoted_price DECIMAL(10,2),
     quoted_currency VARCHAR(3),
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   -- Create lead_notes table
   CREATE TABLE lead_notes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
     note TEXT NOT NULL,
     created_by UUID REFERENCES operators(id),
     created_at TIMESTAMPTZ DEFAULT now()
   );

   -- Create indexes for performance
   CREATE INDEX idx_leads_assigned_operator ON leads(assigned_operator_id);
   CREATE INDEX idx_leads_status ON leads(status);
   CREATE INDEX idx_lead_notes_lead_id ON lead_notes(lead_id);
   ```

3. **Row Level Security (RLS) Setup**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

   -- Operators can only see their own data
   CREATE POLICY "Operators can view own profile" ON operators
     FOR SELECT USING (auth.jwt() ->> 'email' = email);

   -- Operators can only see their assigned leads
   CREATE POLICY "Operators can view assigned leads" ON leads
     FOR ALL USING (
       assigned_operator_id IN (
         SELECT id FROM operators WHERE email = auth.jwt() ->> 'email'
       )
     );

   -- Operators can only manage notes for their leads
   CREATE POLICY "Operators can manage notes for their leads" ON lead_notes
     FOR ALL USING (
       lead_id IN (
         SELECT id FROM leads WHERE assigned_operator_id IN (
           SELECT id FROM operators WHERE email = auth.jwt() ->> 'email'
         )
       )
     );
   ```

### 1.2 Required Tools
- **Docker** for containerizing custom services
- **Vercel/Netlify** for frontend deployment
- **AWS/GCP/DigitalOcean** for backend service deployment
- **GitHub Actions** for CI/CD

### 1.3 Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Custom Services
AI_CORE_SERVICE_URL=https://ai-core.yourdomain.com
B2B_BACKEND_URL=https://b2b-api.yourdomain.com

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPT_KEY=your-encryption-key

# Third-party Services
OPENAI_API_KEY=your-openai-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=notifications@yourdomain.com
SMTP_PASSWORD=your-app-password
```

## 2. Backend Deployment Strategy

### 2.1 Database Integration (Supabase PostgreSQL)
**Adaptation Strategy:**
- Modify existing `database.py` to use Supabase connection string
- Update `models.py` to align with Supabase schema conventions
- Keep existing `crud.py` operations with Supabase-compatible queries

```python
# Updated database.py for Supabase
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from supabase import create_client, Client

# Supabase connection
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQLAlchemy for complex operations
DATABASE_URL = f"postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 2.2 Authentication Integration
**Hybrid Approach:**
- Use Supabase Auth for B2C frontend (travelers)
- Keep custom JWT for B2B operators (more control over operator management)
- Optional: Migrate to Supabase Auth for operators in future iterations

### 2.3 TourMaster AI (B2B) Backend Deployment
**Containerized Deployment:**

```dockerfile
# Dockerfile for B2B Backend
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Deployment Options:**
1. **AWS ECS/Fargate** (Recommended)
2. **Google Cloud Run**
3. **DigitalOcean App Platform**
4. **Railway** or **Render** for simpler setup

### 2.4 Core AI Service Deployment
**Similar containerized approach:**

```dockerfile
# Dockerfile for AI Core Service
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2.5 Inter-service Communication
- Use service discovery or environment variables for service URLs
- Implement API key authentication between services
- Use HTTPS for all inter-service communication

## 3. Frontend Deployment Strategy

### 3.1 SafariGuide AI (B2C) Frontend
**Vercel Deployment (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment Variables in Vercel Dashboard:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://b2b-api.yourdomain.com
```

### 3.2 TourMaster AI (B2B) Dashboard
**Similar Vercel/Netlify deployment:**
```bash
# Build configuration
npm run build

# Environment Variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_B2B_API_URL=https://b2b-api.yourdomain.com
```

## 4. Integration Points

### 4.1 Frontend to Backend Integration
**B2C Frontend → Supabase + B2B Backend:**
```typescript
// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 4.2 B2B Backend to AI Core Service
```python
# In ai_service.py
import httpx
import os

AI_CORE_URL = os.getenv("AI_CORE_SERVICE_URL")
AI_API_KEY = os.getenv("AI_CORE_SERVICE_API_KEY")

async def generate_itinerary(preferences: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{AI_CORE_URL}/generate_itinerary",
            json=preferences,
            headers={"X-API-Key": AI_API_KEY}
        )
        return response.json()
```

### 4.3 Email Notifications via Supabase
```python
# Using Supabase Edge Functions for email
from supabase import create_client

async def send_email_via_supabase(to_email: str, subject: str, content: str):
    response = await supabase.functions.invoke(
        "send-email",
        invoke_options={
            "body": {
                "to": to_email,
                "subject": subject,
                "html": content
            }
        }
    )
    return response
```

## 5. Security Considerations

### 5.1 HTTPS Setup
- Use SSL certificates (Let's Encrypt for cost-effective solution)
- Configure HTTPS redirects
- Implement HSTS headers

### 5.2 API Security
```python
# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/leads")
@limiter.limit("10/minute")
async def create_lead(request: Request, ...):
    # Implementation
```

### 5.3 Environment Security
- Use secret management services (AWS Secrets Manager, etc.)
- Implement key rotation policies
- Use different keys for different environments

## 6. Monitoring & Logging

### 6.1 Application Monitoring
```python
# Add to main.py
import logging
from pythonjsonlogger import jsonlogger

# Configure structured logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
```

### 6.2 Health Checks
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": await check_database_health(),
            "ai_service": await check_ai_service_health()
        }
    }
```

## 7. Testing Strategy

### 7.1 Unit Tests
```python
# test_crud.py
import pytest
from crud import create_lead, get_leads_for_operator

@pytest.mark.asyncio
async def test_create_lead():
    # Test lead creation
    pass

@pytest.mark.asyncio
async def test_lead_assignment():
    # Test operator assignment logic
    pass
```

### 7.2 Integration Tests
```python
# test_integration.py
import pytest
import httpx

@pytest.mark.asyncio
async def test_full_lead_flow():
    # Test B2C → B2B → AI Core Service flow
    async with httpx.AsyncClient() as client:
        # Create lead via B2C
        response = await client.post("/api/leads", json=test_lead_data)
        assert response.status_code == 201
        
        # Verify AI itinerary generation
        lead_id = response.json()["data"]["lead_id"]
        lead_response = await client.get(f"/api/leads/{lead_id}")
        assert lead_response.json()["itinerary"] is not None
```

### 7.3 End-to-End Testing
- Use Playwright or Cypress for frontend testing
- Test complete user journeys across both applications
- Automated testing in CI/CD pipeline

## 8. Deployment Checklist

### Pre-Deployment
- [ ] Supabase project configured with correct schema
- [ ] All environment variables set in deployment platforms
- [ ] SSL certificates configured
- [ ] Database migrations completed
- [ ] RLS policies implemented and tested

### Deployment Steps
1. Deploy AI Core Service
2. Deploy B2B Backend
3. Deploy B2C Frontend
4. Deploy B2B Dashboard
5. Configure DNS and SSL
6. Set up monitoring and alerting
7. Run end-to-end tests

### Post-Deployment
- [ ] Monitor application logs
- [ ] Verify all integrations working
- [ ] Test email notifications
- [ ] Verify AI service connectivity
- [ ] Load test critical endpoints

## 9. Maintenance and Scaling

### Database Scaling
- Use Supabase's built-in connection pooling
- Implement read replicas for heavy read operations
- Monitor query performance and add indexes as needed

### Service Scaling
- Implement horizontal scaling for backend services
- Use container orchestration (Kubernetes) for advanced deployments
- Set up auto-scaling based on CPU/memory usage

### Cost Optimization
- Monitor Supabase usage and optimize queries
- Use CDN for static assets
- Implement caching strategies (Redis for session data)

This comprehensive plan provides a roadmap for moving from development to a fully operational, production-ready system leveraging Supabase's powerful backend infrastructure.
