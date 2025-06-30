
# Tourism Concierge AI - Supabase Integration Deployment Guide

This guide explains how to deploy the Tourism Concierge AI system with Supabase integration.

## 🏗️ Architecture Overview

```
Frontend Applications (Vercel/Netlify)
├── B2C Frontend (SafariGuide AI)
└── B2B Frontend (TourMaster Dashboard)
          │
          ▼
Backend Services (Cloud Run/ECS/VPS)
├── B2B Backend (FastAPI) ──────┐
│   ├── Operator Authentication │
│   ├── Lead Management        │
│   └── Email Notifications    │
│                              │
└── AI Core Service (FastAPI)  │
    ├── Itinerary Generation   │
    └── Knowledge Base         │
          │                    │
          ▼                    ▼
    ┌─────────────────────────────┐
    │     Supabase Database       │
    │  ├── operators             │
    │  ├── leads                 │
    │  └── lead_notes            │
    └─────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Local Development
```bash
# Clone and setup
git clone <repository>
cd tourism-concierge-ai

# Run setup script
chmod +x scripts/local-development.sh
./scripts/local-development.sh
```

### Option 2: Cloud Deployment
```bash
# Setup environment variables in .env
cp .env.example .env
# Edit .env with your values

# Deploy to cloud
chmod +x scripts/deploy-to-cloud.sh
./scripts/deploy-to-cloud.sh
```

## 📋 Prerequisites

### Required Services
- [Supabase Account](https://supabase.com) (Free tier available)
- [OpenAI API Key](https://platform.openai.com) (for AI features)
- [SendGrid Account](https://sendgrid.com) (for email notifications)
- [Docker](https://docker.com) (for containerization)

### Development Tools
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

## 🔧 Configuration

### 1. Supabase Setup
1. Create a new Supabase project
2. Note your project URL and API keys
3. Database schema is automatically created (already done)

### 2. Environment Variables
Create `.env` file with these values:

```bash
# Supabase (Already configured for this project)
SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_PASSWORD=your-database-password-here

# AI Service
OPENAI_API_KEY=your-openai-api-key-here

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# Security
JWT_SECRET=your-super-secret-jwt-key-here
```

## 🌐 Deployment Options

### Local Development
Perfect for development and testing:
```bash
./scripts/local-development.sh
```

Services will be available at:
- AI Core Service: http://localhost:8000
- B2B Backend: http://localhost:8001
- API Docs: http://localhost:8001/docs

### Cloud Deployment
For production deployment:

#### Google Cloud Run (Recommended)
```bash
# Install Google Cloud SDK
# Set up authentication: gcloud auth login
./scripts/deploy-to-cloud.sh
```

#### Other Platforms
- **AWS ECS/Fargate**: Use provided Dockerfiles
- **DigitalOcean Apps**: Direct GitHub integration
- **Heroku**: Container-based deployment

### Frontend Deployment
Both frontends are static applications:

#### Vercel (Recommended)
```bash
# B2C Frontend
cd b2c-frontend
vercel --prod

# B2B Dashboard
cd b2b-dashboard
vercel --prod
```

#### Netlify
```bash
# Build and deploy manually or connect GitHub repo
npm run build
# Upload dist folder to Netlify
```

## 🔐 Security Configuration

### Database Security
- ✅ Row Level Security (RLS) enabled
- ✅ Service role policies configured
- ✅ Operator authentication isolated

### API Security
- Custom JWT authentication for operators
- HTTPS enforcement (automatic with cloud platforms)
- Environment-based secret management

## 🧪 Testing

### Test Operator Login
Default test account (already created):
- Email: `demo@safariexperts.com`
- Password: `password123`

### API Testing
```bash
# Test AI Core Service
curl http://localhost:8000/health

# Test B2B Backend
curl http://localhost:8001/health

# Test authentication
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@safariexperts.com","password":"password123"}'
```

## 📊 Monitoring

### Health Checks
All services expose `/health` endpoints for monitoring.

### Logging
- Structured JSON logging
- Cloud platform integration
- Error tracking with Sentry (optional)

### Database Monitoring
- Supabase built-in dashboard
- Query performance metrics
- Connection monitoring

## 🛠️ Maintenance

### Database Migrations
Database schema is managed through Supabase:
```sql
-- Example: Add new column
ALTER TABLE public.leads ADD COLUMN priority INTEGER DEFAULT 1;
```

### Service Updates
```bash
# Update and redeploy
git pull
./scripts/deploy-to-cloud.sh
```

### Backup Strategy
- Supabase automatic backups (Pro plan)
- Application data export via API
- Configuration backup (environment variables)

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check connection string
python3 -c "from config.database import check_db_connection; print(check_db_connection())"
```

#### Service Communication Issues
```bash
# Check service health
curl -f http://localhost:8000/health
curl -f http://localhost:8001/health
```

#### Frontend API Issues
```bash
# Verify environment variables
echo $VITE_API_URL
```

### Log Analysis
```bash
# View service logs
docker-compose -f docker/docker-compose.supabase.yml logs -f

# View specific service
docker-compose -f docker/docker-compose.supabase.yml logs b2b-backend
```

## 📞 Support

### Resources
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Docker Documentation](https://docs.docker.com)

### Getting Help
1. Check the logs first
2. Verify environment variables
3. Test individual service health
4. Check database connectivity

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Services deployed and healthy
- [ ] Frontend applications deployed
- [ ] Domain names configured (optional)
- [ ] SSL certificates configured
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit performed

---

🎉 **You're all set!** Your Tourism Concierge AI system is now running with Supabase integration.

For questions or issues, refer to the troubleshooting section above or check the service logs.
