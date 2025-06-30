
// API Types and Specifications for FastAPI Backend
// This file defines the complete data structures and API contracts

export interface Lead {
  id: string;
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  assignedOperatorId: string;
  
  // Traveler Information
  traveler: {
    name: string;
    email: string;
    phone: string;
    country: string;
  };
  
  // Trip Preferences
  preferences: {
    destination: string;
    duration: number; // days
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    travelDates: {
      startDate: string;
      endDate: string;
      flexible: boolean;
    };
    groupSize: number;
    interests: string[];
    accommodationType: 'budget' | 'mid-range' | 'luxury';
  };
  
  // AI-Generated Itinerary
  itinerary: TripItinerary;
  
  // Lead Management
  notes: string[];
  quotedPrice?: number;
  quotedCurrency?: string;
}

export interface TripItinerary {
  id: string;
  title: string;
  overview: string;
  totalDuration: number;
  estimatedCost: {
    amount: number;
    currency: string;
    breakdown: {
      accommodation: number;
      transport: number;
      activities: number;
      meals: number;
      other: number;
    };
  };
  days: ItineraryDay[];
}

export interface ItineraryDay {
  day: number;
  location: string;
  accommodation: {
    name: string;
    type: string;
    rating: number;
  };
  activities: Activity[];
  meals: string[];
  transport: string;
  notes: string;
}

export interface Activity {
  name: string;
  duration: string;
  description: string;
  cost: number;
  type: 'safari' | 'cultural' | 'adventure' | 'relaxation' | 'sightseeing';
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  specializations: string[];
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Endpoints Specification for FastAPI Backend:
/*
POST /api/leads - Create new lead from B2C app
GET /api/leads - Get paginated leads for operator
GET /api/leads/{id} - Get specific lead details
PUT /api/leads/{id}/status - Update lead status
POST /api/leads/{id}/notes - Add note to lead
PUT /api/leads/{id}/quote - Add quote to lead

POST /api/auth/login - Operator authentication
GET /api/auth/me - Get current operator info
POST /api/auth/logout - Logout operator

GET /api/operators - Get all operators (admin)
POST /api/operators - Create new operator (admin)

POST /api/ai/generate-itinerary - Generate itinerary via AI Core Service
*/
