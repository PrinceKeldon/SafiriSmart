
# TourMaster AI (B2B) Backend API Specifications

## Overview
This document provides complete API specifications for the FastAPI backend that should be built to support the TourMaster AI B2B frontend application.

## Base Configuration
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based authentication
- **Environment**: Python 3.9+

## Required Python Dependencies
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
pydantic>=2.4.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
emails>=0.6.0
python-dotenv>=1.0.0
```

## Database Schema

### Tables

#### operators
```sql
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    specializations TEXT[], -- array of specialization strings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### leads
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) CHECK (status IN ('new', 'contacted', 'quoted', 'booked', 'cancelled')) DEFAULT 'new',
    assigned_operator_id UUID REFERENCES operators(id),
    
    -- Traveler Information (JSON or separate columns)
    traveler_name VARCHAR(255) NOT NULL,
    traveler_email VARCHAR(255) NOT NULL,
    traveler_phone VARCHAR(50),
    traveler_country VARCHAR(100),
    
    -- Trip Preferences (stored as JSONB for flexibility)
    preferences JSONB NOT NULL,
    
    -- AI-Generated Itinerary (stored as JSONB)
    itinerary JSONB,
    
    -- Quote Information
    quoted_price DECIMAL(10,2),
    quoted_currency VARCHAR(3),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### lead_notes
```sql
CREATE TABLE lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by UUID REFERENCES operators(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
**Purpose**: Authenticate tour operator

**Request Body**:
```json
{
  "email": "operator@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "operator": {
      "id": "uuid",
      "name": "John Doe",
      "email": "operator@example.com",
      "company": "Safari Tours Ltd",
      "specializations": ["Kenya Safari", "Tanzania Safari"]
    }
  }
}
```

#### GET /api/auth/me
**Purpose**: Get current operator information
**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "operator@example.com",
    "company": "Safari Tours Ltd",
    "specializations": ["Kenya Safari", "Tanzania Safari"],
    "is_active": true
  }
}
```

### Lead Management Endpoints

#### POST /api/leads
**Purpose**: Create new lead (called by B2C SafariGuide AI application)
**Headers**: `Authorization: Bearer {api_key}` (service-to-service auth)

**Request Body**:
```json
{
  "traveler": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "country": "United States"
  },
  "preferences": {
    "destination": "Kenya",
    "duration": 7,
    "budget": {
      "min": 3000,
      "max": 5000,
      "currency": "USD"
    },
    "travel_dates": {
      "start_date": "2024-03-15",
      "end_date": "2024-03-22",
      "flexible": true
    },
    "group_size": 2,
    "interests": ["Wildlife Safari", "Photography"],
    "accommodation_type": "luxury"
  },
  "itinerary": null // Optional - will be generated if not provided
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "lead_id": "uuid",
    "status": "new",
    "assigned_operator": {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@safariexperts.com"
    }
  },
  "message": "Lead created and assigned successfully"
}
```

#### GET /api/leads
**Purpose**: Get paginated leads for authenticated operator
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 100)
- `status` (string, optional): Filter by status
- `search` (string, optional): Search in traveler name/email

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "new",
      "traveler": {
        "name": "John Smith",
        "email": "john@example.com",
        "phone": "+1-555-0123",
        "country": "United States"
      },
      "preferences": { /* full preferences object */ },
      "itinerary": { /* full itinerary object */ },
      "quoted_price": null,
      "quoted_currency": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

#### GET /api/leads/{lead_id}
**Purpose**: Get specific lead details
**Headers**: `Authorization: Bearer {token}`

**Response**: Same as single lead object above with additional notes array

#### PUT /api/leads/{lead_id}/status
**Purpose**: Update lead status
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "status": "contacted"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "lead_id": "uuid",
    "old_status": "new",
    "new_status": "contacted",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

#### POST /api/leads/{lead_id}/notes
**Purpose**: Add note to lead
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "note": "Called customer, very interested in luxury safari options"
}
```

#### PUT /api/leads/{lead_id}/quote
**Purpose**: Add quote to lead
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "quoted_price": 4500.00,
  "quoted_currency": "USD",
  "note": "Quote includes luxury accommodation upgrade"
}
```

### AI Integration Endpoint

#### POST /api/ai/generate-itinerary
**Purpose**: Generate itinerary via AI Core Service (internal use)
**Headers**: `Authorization: Bearer {service_token}`

**Request Body**:
```json
{
  "preferences": {
    "destination": "Kenya",
    "duration": 7,
    "budget": {
      "min": 3000,
      "max": 5000,
      "currency": "USD"
    },
    "interests": ["Wildlife Safari", "Photography"],
    "accommodation_type": "luxury"
  }
}
```

## Business Logic Requirements

### Lead Assignment Logic
Implement one of these strategies:
1. **Round-robin**: Assign to next operator in rotation
2. **Specialization-based**: Assign based on operator specializations matching destination
3. **Load-based**: Assign to operator with fewest active leads

### Email Notifications
Send automated emails when:
- New lead is assigned to operator
- Lead status changes to 'booked'
- Lead has been 'new' for more than 24 hours (reminder)

### Security Requirements
- JWT tokens with 1-hour expiration
- Password hashing using bcrypt
- Input validation using Pydantic models
- Rate limiting on all endpoints
- CORS configuration for frontend domain

### Environment Variables Required
```
DATABASE_URL=postgresql://user:password@localhost/tourmaster_b2b
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notifications@yourcompany.com
EMAIL_PASSWORD=app-password
AI_CORE_SERVICE_URL=http://localhost:8001
AI_CORE_SERVICE_API_KEY=your-ai-service-key
```

## Error Handling
All endpoints should return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"],
  "error_code": "VALIDATION_ERROR"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

This completes the comprehensive API specification for your FastAPI backend implementation.
