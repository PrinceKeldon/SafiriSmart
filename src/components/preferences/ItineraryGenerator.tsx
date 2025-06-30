import { TravelPreferences, TourOutput } from './WizardTypes';
import { b2cApiService } from '@/services/B2CApiService';

export const generateItinerary = async (preferences: TravelPreferences): Promise<TourOutput> => {
  try {
    console.log('Calling AI Core Service with preferences:', preferences);
    
    // Transform preferences to match AI Core Service format
    const aiPreferences = {
      duration: preferences.duration,
      budgetRange: preferences.budgetRange,
      interests: preferences.interests,
      groupSize: preferences.groupSize,
      travelPace: preferences.travelPace
    };

    const response = await b2cApiService.generateItinerary(aiPreferences);
    
    // Transform AI response to TourOutput format
    const itinerary: TourOutput = {
      tour_name: response.tour_name || `${preferences.duration}-Day Kenya Safari Adventure`,
      summary: response.summary || `Experience the best of Kenya's wildlife and landscapes with this carefully crafted ${preferences.duration}-day safari.`,
      itinerary_details: response.itinerary_details || generateDefaultItinerary(preferences),
      inclusions_suggestions: response.inclusions_suggestions || getDefaultInclusions(preferences),
      exclusions_suggestions: response.exclusions_suggestions || getDefaultExclusions(),
      important_notes: response.important_notes || getDefaultNotes(preferences)
    };

    return itinerary;
  } catch (error) {
    console.error('Error calling AI Core Service:', error);
    
    // Fallback to mock data if API call fails
    console.log('Falling back to mock itinerary generation');
    return generateMockItinerary(preferences);
  }
};

// Keep the existing mock generation as fallback
export const generateMockItinerary = (preferences: TravelPreferences): Promise<TourOutput> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockItinerary: TourOutput = {
        tour_name: `${preferences.duration}-Day Ultimate Kenya Safari Adventure`,
        summary: `Experience the best of Kenya's wildlife and landscapes with this carefully crafted ${preferences.duration}-day safari. Perfect for ${preferences.groupSize} travelers seeking a ${preferences.travelPace} pace adventure with ${preferences.budgetRange} accommodations. Guide speaks ${preferences.languages.join(', ')}.`,
        itinerary_details: generateDefaultItinerary(preferences),
        inclusions_suggestions: getDefaultInclusions(preferences),
        exclusions_suggestions: getDefaultExclusions(),
        important_notes: getDefaultNotes(preferences)
      };
      resolve(mockItinerary);
    }, 2000);
  });
};

const generateDefaultItinerary = (preferences: TravelPreferences) => {
  return Array.from({ length: preferences.duration }, (_, index) => ({
    day_number: index + 1,
    theme: index === 0 ? 'Arrival & Masai Mara' : 
           index === 1 ? 'Masai Mara Full Day' :
           index === 2 ? 'Lake Nakuru Adventure' :
           index === preferences.duration - 1 ? 'Departure' :
           `Wildlife & Culture Day ${index + 1}`,
    location: index === 0 ? 'Nairobi to Masai Mara' :
             index === 1 ? 'Masai Mara National Reserve' :
             index === 2 ? 'Lake Nakuru National Park' :
             index === preferences.duration - 1 ? 'Nairobi' :
             'Amboseli National Park',
    activities: preferences.interests.includes('Wildlife Safari') ? 
      ['Game Drive', 'Wildlife Photography', 'Bush Breakfast'] :
      ['Nature Walk', 'Cultural Visit', 'Scenic Drive'],
    accommodation_suggestion: preferences.budgetRange === 'luxury' ? 
      'Luxury Safari Lodge with Private Balcony' :
      preferences.budgetRange === 'mid-range' ?
      'Comfortable Safari Camp with Ensuite Facilities' :
      'Budget-Friendly Safari Lodge',
    meals: preferences.dietary.mealWishes ? 
      ['Breakfast (Dietary accommodated)', 'Lunch (Dietary accommodated)', 'Dinner (Dietary accommodated)'] :
      ['Breakfast', 'Lunch', 'Dinner'],
    travel_notes: index === 0 ? `Entry point: ${preferences.travel.portOfEntry || 'TBD'}` : undefined,
    pickup_details: index === 0 && preferences.travel.airportPickup ? {
      time: preferences.travel.pickupTime || 'TBD',
      location: preferences.travel.pickupLocation || 'TBD'
    } : undefined
  }));
};

const getDefaultInclusions = (preferences: TravelPreferences) => [
  'All park entrance fees',
  'Professional safari guide',
  'Game drives as per itinerary',
  'Accommodation as specified',
  'All meals during safari',
  'Transportation in 4WD safari vehicle',
  `Guide fluent in ${preferences.languages.join(', ')}`
];

const getDefaultExclusions = () => [
  'International flights',
  'Visa fees',
  'Personal expenses',
  'Alcoholic beverages',
  'Travel insurance',
  'Tips and gratuities'
];

const getDefaultNotes = (preferences: TravelPreferences) => [
  'Best time to travel is during dry seasons (June-October, December-March)',
  'Comfortable walking shoes and neutral-colored clothing recommended',
  'Binoculars and camera equipment advised for wildlife viewing',
  'Yellow fever vaccination may be required depending on your country of origin',
  preferences.dietary.allergies ? `Please inform guide of allergies: ${preferences.dietary.allergies}` : ''
].filter(Boolean);
