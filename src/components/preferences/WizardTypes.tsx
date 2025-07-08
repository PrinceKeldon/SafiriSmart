
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
  { id: 1, title: 'Your Interests', description: 'What type of experiences are you looking for?' },
  { id: 2, title: 'Duration', description: 'How long would you like your safari to be?' },
  { id: 3, title: 'Group Size', description: 'How many people will be traveling?' },
  { id: 4, title: 'Budget', description: 'What\'s your preferred budget range?' },
  { id: 5, title: 'Travel Pace', description: 'What pace do you prefer for your journey?' },
  { id: 6, title: 'Languages', description: 'What languages would you like your guide to speak?' },
  { id: 7, title: 'Schedule', description: 'When would you like to travel?' },
  { id: 8, title: 'Travel Details', description: 'Let us know about your travel logistics' },
  { id: 9, title: 'Dietary Needs', description: 'Any dietary requirements we should know about?' }
];
