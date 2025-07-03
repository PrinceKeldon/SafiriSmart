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
  schedule?: {
    startDate?: string;
    endDate?: string;
    flexible?: boolean;
  };
  travel?: {
    portOfEntry?: string;
    airportPickup?: boolean;
    pickupDetails?: {
      time?: string;
      location?: string;
    };
  };
  dietary?: {
    mealWishes?: string;
    allergies?: string;
    specialRequirements?: string;
  };
  languages?: string[];
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
  notes?: string;
  pickup_details?: {
    time?: string;
    location?: string;
  };
  travel_notes?: string;
}

export interface Activity {
  name: string;
  duration: string;
  description: string;
  cost: number;
  type: string;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  specializations: string[];
  isActive: boolean;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
  created_by: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LeadListResponse {
  leads: any[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeadResponse {
  lead_id: string;
  status: string;
  assigned_operator: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Re-export Lead from lead.ts to maintain compatibility
export { Lead } from '@/types/lead';
