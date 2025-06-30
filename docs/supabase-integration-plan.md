
# Supabase Integration & Deployment Plan
## Tourism Concierge AI Backend Services

### Overview
This plan details how to deploy and integrate our two Python FastAPI services with Supabase as our managed PostgreSQL database, while maintaining our custom operator authentication system.

## Architecture Components

### 1. Database Layer (Supabase PostgreSQL)
- **Primary Database**: Supabase PostgreSQL instance
- **Tables**: `operators`, `leads`, `lead_notes` (already created)
- **Connection**: Python FastAPI services connect via SQLAlchemy using Supabase connection string
- **Security**: Row Level Security (RLS) enabled with service role policies

### 2. Backend Services

#### A. TourMaster AI (B2B) Backend
- **Technology**: Python FastAPI
- **Purpose**: Operator authentication, lead management, CRUD operations
- **Deployment**: Containerized service (Docker → Cloud Run/ECS/VPS)
- **Database**: Connects to Supabase PostgreSQL via SQLAlchemy
- **Authentication**: Custom JWT system using our `operators` table

#### B. Core AI Service
- **Technology**: Python FastAPI
- **Purpose**: Itinerary generation using embedded knowledge base
- **Deployment**: Containerized service (Docker → Cloud Run/ECS/VPS)
- **Knowledge Base**: Embedded in service (MVP approach)
- **Future Enhancement**: Externalize to Supabase tables for dynamic updates

### 3. Frontend Applications
- **B2C Frontend**: SafariGuide AI (Static hosting: Vercel/Netlify)
- **B2B Frontend**: TourMaster AI Dashboard (Static hosting: Vercel/Netlify)

## Deployment Strategy

### Phase 1: Environment Setup

#### 1.1 Supabase Configuration
```bash
# Supabase connection details needed:
SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[Required for backend services]
```

#### 1.2 Database Connection String
```bash
# PostgreSQL connection for SQLAlchemy
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres
```

### Phase 2: Backend Service Deployment

#### 2.1 TourMaster AI (B2B) Backend
**Dockerfile Configuration:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Environment Variables:**
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres
SECRET_KEY=[JWT_SECRET]
AI_CORE_SERVICE_URL=https://[AI_CORE_SERVICE_DOMAIN]
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=[SENDGRID_USERNAME]
EMAIL_PASSWORD=[SENDGRID_PASSWORD]
```

**Deployment Options:**
1. **Google Cloud Run** (Recommended for MVP)
   - Serverless, auto-scaling
   - Simple container deployment
   - Built-in HTTPS

2. **AWS ECS/Fargate**
   - Container orchestration
   - Integration with AWS services

3. **DigitalOcean App Platform**
   - Simple deployment from GitHub
   - Automatic HTTPS

#### 2.2 Core AI Service
**Dockerfile Configuration:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Environment Variables:**
```bash
OPENAI_API_KEY=[OPENAI_KEY]
API_V1_STR=/api
```

### Phase 3: Frontend Deployment

#### 3.1 B2C Frontend (SafariGuide AI)
**Platform**: Vercel/Netlify
**Environment Variables:**
```bash
VITE_API_URL=https://[B2B_BACKEND_DOMAIN]/api
VITE_SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3.2 B2B Frontend (TourMaster Dashboard)
**Platform**: Vercel/Netlify
**Environment Variables:**
```bash
VITE_API_URL=https://[B2B_BACKEND_DOMAIN]/api
```

## Integration Points

### 1. Backend to Supabase Database
**Connection Method**: SQLAlchemy with Supabase PostgreSQL connection string
**Files to Update**:
- `database.py`: Update DATABASE_URL to Supabase connection
- Keep existing `models.py` and `crud.py` unchanged
- RLS policies ensure security at database level

### 2. Frontend to Backend APIs
**B2C Frontend → B2B Backend**:
- Lead creation endpoint: `POST /api/leads`
- Update frontend API base URL

**B2B Frontend → B2B Backend**:
- Authentication: `POST /api/auth/login`
- Lead management: `GET /api/leads`, `PUT /api/leads/{id}/status`
- Update frontend API base URL

### 3. B2B Backend to AI Core Service
**Integration**: HTTP API calls
**Endpoint**: AI Core Service `/generate-itinerary`
**Configuration**: Update `AI_CORE_SERVICE_URL` in B2B backend

### 4. Email Notifications
**Service**: SendGrid SMTP
**Integration**: Existing `email_service.py`
**Configuration**: SMTP credentials in environment variables

## Security Considerations

### 1. Database Security
- ✅ RLS enabled on all tables
- ✅ Service role policies for backend access
- ✅ Operator data isolated by authentication

### 2. API Security
- Custom JWT authentication for operators
- HTTPS enforcement on all services
- API key management for service-to-service communication

### 3. Environment Variables
- Secure secret management (cloud provider secrets)
- No sensitive data in code repositories
- Separate environments (dev/staging/prod)

## Knowledge Base Strategy

### MVP Approach (Embedded)
- Knowledge base remains embedded in AI Core Service
- Located in `main.py` as `KenyaDestinations`, `AccommodationManager`
- Updates require service redeployment
- Simple and reliable for initial launch

### Future Enhancement (Externalized)
```sql
-- Future tables for dynamic knowledge base
CREATE TABLE destinations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    activities JSONB,
    location JSONB
);

CREATE TABLE accommodations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    price_range TEXT,
    amenities JSONB
);
```

## Monitoring & Logging

### 1. Application Monitoring
- Health check endpoints: `/health`
- Service uptime monitoring
- Error tracking (Sentry recommended)

### 2. Database Monitoring
- Supabase built-in monitoring
- Query performance tracking
- Connection pool monitoring

### 3. Logging Strategy
- Structured logging in JSON format
- Centralized log aggregation
- Error alerting setup

## Step-by-Step Deployment Checklist

### Pre-Deployment
- [ ] Supabase project configured
- [ ] Database schema migrated (✅ Complete)
- [ ] Environment variables prepared
- [ ] Docker images built and tested

### Backend Deployment
- [ ] Deploy AI Core Service to cloud platform
- [ ] Deploy B2B Backend to cloud platform
- [ ] Verify inter-service communication
- [ ] Run integration tests

### Frontend Deployment
- [ ] Deploy B2C Frontend to Vercel/Netlify
- [ ] Deploy B2B Frontend to Vercel/Netlify
- [ ] Update API endpoint configurations
- [ ] Test end-to-end workflows

### Post-Deployment
- [ ] Verify operator login functionality
- [ ] Test lead creation and assignment
- [ ] Confirm email notifications working
- [ ] Set up monitoring and alerting

## Cost Optimization

### Supabase
- Start with free tier (up to 500MB database)
- Upgrade to Pro plan as needed ($25/month)

### Cloud Services
- Use serverless options (Cloud Run) for cost efficiency
- Implement auto-scaling based on demand
- Monitor usage and optimize resource allocation

## Rollback Strategy

### Database
- Supabase automatic backups
- Point-in-time recovery available

### Services
- Container image versioning
- Blue-green deployment capability
- Quick rollback to previous versions

## Success Metrics

### Technical
- Service uptime > 99.5%
- API response time < 500ms
- Zero data loss events

### Business
- Operator onboarding time < 5 minutes
- Lead processing time < 24 hours
- Email delivery rate > 95%

---

This plan provides a robust foundation for deploying our Tourism Concierge AI system with Supabase integration while maintaining the flexibility and power of our custom Python FastAPI services.
