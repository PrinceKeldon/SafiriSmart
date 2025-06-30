
# TourMaster AI - B2B Backend

A comprehensive FastAPI backend for managing safari tour leads and bookings, designed for tour operators.

## Features

- **JWT Authentication**: Secure login system for tour operators
- **Lead Management**: Create, view, update, and manage safari leads
- **AI Integration**: Automatic itinerary generation via Core AI Service
- **Email Notifications**: Automated notifications for new leads
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Database Setup

Set up PostgreSQL database and update the connection string in `.env`:

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/tourmaster_b2b
```

### 3. Environment Variables

Configure the following in your `.env` file:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `EMAIL_*`: Email service configuration
- `AI_CORE_SERVICE_URL`: URL to the AI Core Service

### 4. Initialize Database

```bash
python create_sample_data.py
```

This creates the database tables and a sample operator account:
- Email: `demo@safariexperts.com`
- Password: `password123`

### 5. Run the Application

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Operator login
- `GET /api/auth/me` - Get current operator details

### Lead Management
- `POST /api/leads` - Create new lead
- `GET /api/leads` - List leads (paginated, filtered)
- `GET /api/leads/{id}` - Get lead details
- `PUT /api/leads/{id}/status` - Update lead status
- `POST /api/leads/{id}/notes` - Add note to lead
- `PUT /api/leads/{id}/quote` - Add quote to lead

### Health Checks
- `GET /` - Root endpoint
- `GET /health` - Health check

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## Architecture

```
├── main.py              # FastAPI application and endpoints
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic request/response schemas
├── database.py          # Database configuration and connection
├── auth.py              # JWT authentication utilities
├── crud.py              # Database operations
├── email_service.py     # Email notification service
├── ai_service.py        # AI Core Service integration
├── config.py            # Application configuration
└── create_sample_data.py # Database initialization script
```

## Integration with AI Core Service

The backend automatically calls the AI Core Service to generate itineraries when:
1. A new lead is created without an existing itinerary
2. The AI service is available at the configured URL

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy ORM
- CORS configuration for frontend integration

## Development

For development with auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy with a production ASGI server like Gunicorn + Uvicorn
