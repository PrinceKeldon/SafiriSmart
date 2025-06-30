
export interface TravelPreferences {
  duration: number;
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
  groupSize: number;
  travelPace: 'relaxed' | 'moderate' | 'active';
  languages: string[];
  schedule: {
    startDate?: Date;
    endDate?: Date;
    flexible: boolean;
  };
  travel: {
    portOfEntry?: string;
    airportPickup: boolean;
    pickupTime?: string;
    pickupLocation?: string;
  };
  dietary: {
    mealWishes?: string;
    allergies?: string;
    specialRequirements?: string;
  };
}

export interface TourOutput {
  tour_name: string;
  summary: string;
  itinerary_details: {
    day_number: number;
    theme: string;
    location: string;
    activities: string[];
    accommodation_suggestion: string;
    meals?: string[];
    travel_notes?: string;
    pickup_details?: {
      time: string;
      location: string;
    };
  }[];
  inclusions_suggestions: string[];
  exclusions_suggestions: string[];
  important_notes: string[];
}

export const initialPreferences: TravelPreferences = {
  duration: 7,
  budgetRange: 'mid-range',
  interests: [],
  groupSize: 2,
  travelPace: 'moderate',
  languages: ['English'],
  schedule: {
    flexible: true,
  },
  travel: {
    portOfEntry: '',
    airportPickup: false,
    pickupTime: '',
    pickupLocation: '',
  },
  dietary: {
    mealWishes: '',
    allergies: '',
    specialRequirements: '',
  },
};

export const steps = [
  { id: 1, title: 'Duration', description: 'How long is your ideal safari?' },
  { id: 2, title: 'Budget', description: 'What\'s your budget preference?' },
  { id: 3, title: 'Interests', description: 'What interests you most?' },
  { id: 4, title: 'Group Size', description: 'How many travelers?' },
  { id: 5, title: 'Travel Pace', description: 'What\'s your preferred pace?' },
  { id: 6, title: 'Languages', description: 'Which languages should your guide speak?' },
  { id: 7, title: 'Schedule', description: 'When would you like to travel?' },
  { id: 8, title: 'Travel Logistics', description: 'Airport and pickup details' },
  { id: 9, title: 'Dietary', description: 'Any dietary requirements?' },
];
