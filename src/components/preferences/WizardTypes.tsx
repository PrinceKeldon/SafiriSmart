
export interface UserDetails {
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

export interface TravelPreferences {
  interests: string[];
  duration: number;
  groupSize: number;
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  travelPace: 'relaxed' | 'moderate' | 'active';
  languages: string[];
  schedule: {
    startDate?: Date;
    endDate?: Date;
    flexible: boolean;
  };
}

export interface TourOutput {
  tour_name: string;
  summary: string;
  itinerary_details: Array<{
    day_number: number;
    theme: string;
    location: string;
    activities: string[];
    accommodation_suggestion: string;
    meals: string[];
    travel_notes?: string;
    pickup_details?: {
      time: string;
      location: string;
    };
  }>;
  inclusions_suggestions: string[];
  exclusions_suggestions: string[];
  important_notes: string[];
}

export const steps = [
  { id: 1, title: 'Interests', description: 'What interests you most?' },
  { id: 2, title: 'Duration', description: 'How long is your trip?' },
  { id: 3, title: 'Group Size', description: 'How many travelers?' },
  { id: 4, title: 'Budget', description: 'What\'s your budget range?' },
  { id: 5, title: 'Travel Pace', description: 'What\'s your preferred pace?' },
  { id: 6, title: 'Languages', description: 'Preferred languages?' },
  { id: 7, title: 'Schedule', description: 'When do you want to travel?' },
  { id: 8, title: 'Logistics', description: 'Travel arrangements?' },
  { id: 9, title: 'Dietary', description: 'Any dietary requirements?' },
  { id: 10, title: 'Contact Info', description: 'Your details for quotes' }
];
