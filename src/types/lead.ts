
export interface LeadTodoItem {
  id: string;
  task: string;
  completed: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  status: 'unclaimed' | 'claimed' | 'contacted' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';
  assigned_operator_id?: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone?: string;
  traveler_country?: string;
  preferences: any;
  itinerary?: any;
  quoted_price?: number;
  quoted_currency?: string;
  todo_checklist: LeadTodoItem[];
  created_at: string;
  updated_at: string;
}

export interface LeadVisibility {
  id: string;
  lead_id: string;
  operator_id: string;
  created_at: string;
}

export interface CompletedLead {
  id: string;
  original_lead_id: string;
  operator_id: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone?: string;
  traveler_country?: string;
  itinerary_summary?: any;
  destinations?: string[];
  travel_dates?: any;
  group_size?: number;
  quoted_price?: number;
  quoted_currency?: string;
  completed_at: string;
  created_at: string;
}
