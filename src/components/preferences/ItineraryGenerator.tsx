import { TravelPreferences, TourOutput } from './WizardTypes';
import { generateSmartItinerary } from './SmartItineraryGenerator';
import { generateEnhancedItinerary, generateCreativeMockItinerary } from './EnhancedItineraryGenerator';

export const generateItinerary = async (preferences: TravelPreferences): Promise<TourOutput> => {
  console.log('🎯 Starting smart itinerary generation with package matching...');
  
  try {
    // First try smart generation with package matching
    console.log('🧠 Attempting smart generation with package matching');
    return await generateSmartItinerary(preferences);
  } catch (error) {
    console.warn('⚠️ Smart generation failed, trying enhanced AI service:', error);
    
    try {
      // Fallback to enhanced AI service
      return await generateEnhancedItinerary(preferences);
    } catch (enhancedError) {
      console.error('❌ Enhanced itinerary generation failed completely:', enhancedError);
      
      // Final fallback to creative mock generation
      console.log('🎨 Using creative mock generation as final fallback');
      return generateCreativeMockItinerary(preferences);
    }
  }
};

// Keep the existing mock generation as legacy fallback
export const generateMockItinerary = (preferences: TravelPreferences): Promise<TourOutput> => {
  console.log('⚠️ Using legacy mock itinerary generation');
  return generateCreativeMockItinerary(preferences);
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
    meals: preferences.dietary?.mealWishes ? 
      ['Breakfast (Dietary accommodated)', 'Lunch (Dietary accommodated)', 'Dinner (Dietary accommodated)'] :
      ['Breakfast', 'Lunch', 'Dinner'],
    travel_notes: index === 0 ? `Entry point: ${preferences.travel?.portOfEntry || 'TBD'}` : undefined,
    pickup_details: index === 0 && preferences.travel?.airportPickup ? {
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
  preferences.dietary?.allergies ? `Please inform guide of allergies: ${preferences.dietary.allergies}` : ''
].filter(Boolean);
