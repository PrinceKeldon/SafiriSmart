
# Frontend Integration Guide - Phase 2

This guide covers the integration of both TourMaster AI frontends with the deployed backend services.

## Overview

Phase 2 replaces all mock data and simulated API calls with real API integration to:
- TourMaster AI (B2B) Backend (deployed at your backend URL)
- AI Core Service (deployed at your AI service URL)

## B2B Frontend Integration

### 1. Environment Configuration

Create a `.env` file in the B2B frontend root directory:

```env
# Backend Service URLs
VITE_B2B_BACKEND_URL=https://your-deployed-b2b-backend-url
VITE_AI_CORE_SERVICE_URL=https://your-deployed-ai-core-service-url

# For local development, use:
# VITE_B2B_BACKEND_URL=http://localhost:8001
# VITE_AI_CORE_SERVICE_URL=http://localhost:8000
```

### 2. Key Changes Made

#### ApiService (`src/services/ApiService.ts`)
- Centralized API client for all backend communication
- Automatic token management and authentication headers
- Error handling and response parsing
- Support for all CRUD operations on leads, operators, and packages

#### Updated AuthContext (`src/contexts/AuthContext.tsx`)
- Real login/logout API calls
- Token validation on app startup
- Automatic token refresh and error handling
- Proper user session management

#### Updated Hooks
- `useOperatorProfile.ts` - Real operator profile management
- `useOperatorPackages.ts` - Real package CRUD operations  
- `useLeads.ts` - Real lead management and notes

#### AiService (`src/services/AiService.ts`)
- Integration with AI Core Service for itinerary generation
- Lead creation through AI Core Service

### 3. Authentication Flow

1. User enters credentials on login page
2. Frontend calls `/api/auth/login` endpoint
3. Backend validates credentials and returns JWT token
4. Token stored in localStorage and included in all subsequent requests
5. Token validated on app startup by calling `/api/auth/me`

### 4. Data Flow

**Leads Management:**
- Fetch leads: `GET /api/leads` with pagination and filtering
- Update lead status: `PUT /api/leads/{id}/status`
- Add notes: `POST /api/leads/{id}/notes`
- Update quotes: `PUT /api/leads/{id}/quote`

**Operator Profile:**
- Get profile: `GET /api/operator/profile`
- Update profile: `PUT /api/operator/profile`

**Package Management:**
- List packages: `GET /api/operator/packages`
- Create package: `POST /api/operator/packages`
- Update package: `PUT /api/operator/packages/{id}`
- Delete package: `DELETE /api/operator/packages/{id}`

### 5. Error Handling

- Network errors are caught and displayed as user-friendly messages
- Authentication errors trigger automatic logout
- Validation errors are shown inline in forms
- Loading states are managed through React Query

### 6. Development vs Production

**Development:**
- Uses localhost URLs for backend services
- Detailed error logging in console
- Mock data fallbacks if services are unavailable

**Production:**
- Uses deployed service URLs
- Minimal logging
- Proper error boundaries and fallbacks

## B2C Frontend Integration

The B2C frontend (SafariGuide AI) primarily needs to integrate with:

### 1. AI Core Service Integration
- Itinerary generation API calls
- Lead submission to B2B backend

### 2. Environment Variables Needed
```env
VITE_AI_CORE_SERVICE_URL=https://your-deployed-ai-core-service-url
VITE_B2B_BACKEND_URL=https://your-deployed-b2b-backend-url
```

### 3. Key Integration Points
- Replace mock itinerary generation with real AI Core Service calls
- Submit completed lead forms to B2B backend for operator assignment
- Handle loading states during AI generation
- Error handling for API failures

## Testing Integration

### 1. Local Testing
1. Start both backend services locally
2. Set environment variables to localhost URLs
3. Test full user flows end-to-end

### 2. Production Testing
1. Deploy frontend with production environment variables
2. Test authentication flow
3. Verify all CRUD operations work
4. Test error scenarios (network failures, invalid tokens)

### 3. Key Test Scenarios
- **Authentication:** Login, logout, token refresh, invalid credentials
- **Leads:** List, filter, update status, add notes, quote
- **Packages:** CRUD operations, validation
- **Profile:** Update operator information
- **AI Integration:** Itinerary generation, lead creation

## Troubleshooting

### Common Issues

1. **CORS Errors:** Ensure backend has proper CORS configuration
2. **Authentication Failures:** Check token format and expiration
3. **Network Timeouts:** Verify service URLs and network connectivity
4. **Data Loading Issues:** Check API response formats match frontend expectations

### Debug Tools

1. **Browser Network Tab:** Monitor API calls and responses
2. **React Query DevTools:** Inspect query states and cache
3. **Console Logs:** ApiService includes detailed logging
4. **Backend Logs:** Check deployed service logs for errors

## Performance Considerations

1. **Caching:** React Query provides automatic caching of API responses
2. **Pagination:** Large datasets are paginated to improve performance
3. **Debouncing:** Search inputs are debounced to reduce API calls
4. **Optimistic Updates:** UI updates immediately for better UX

## Security

1. **Token Management:** JWT tokens stored securely in localStorage
2. **HTTPS:** All production API calls use HTTPS
3. **Validation:** Input validation on both frontend and backend
4. **Error Messages:** Generic error messages to prevent information leakage

This integration provides a robust, production-ready connection between the frontends and backend services with proper error handling, security, and performance optimizations.
