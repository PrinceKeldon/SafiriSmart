
import { TravelPreferences, TourOutput } from './WizardTypes';

export const generateMockItinerary = (preferences: TravelPreferences): Promise<TourOutput> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockItinerary: TourOutput = {
        tour_name: `${preferences.duration}-Day Ultimate Kenya Safari Adventure`,
        summary: `Experience the best of Kenya's wildlife and landscapes with this carefully crafted ${preferences.duration}-day safari. Perfect for ${preferences.groupSize} travelers seeking a ${preferences.travelPace} pace adventure with ${preferences.budgetRange} accommodations. Guide speaks ${preferences.languages.join(', ')}.`,
        itinerary_details: Array.from({ length: preferences.duration }, (_, index) => ({
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
        })),
        inclusions_suggestions: [
          'All park entrance fees',
          'Professional safari guide',
          'Game drives as per itinerary',
          'Accommodation as specified',
          'All meals during safari',
          'Transportation in 4WD safari vehicle',
          `Guide fluent in ${preferences.languages.join(', ')}`
        ],
        exclusions_suggestions: [
          'International flights',
          'Visa fees',
          'Personal expenses',
          'Alcoholic beverages',
          'Travel insurance',
          'Tips and gratuities'
        ],
        important_notes: [
          'Best time to travel is during dry seasons (June-October, December-March)',
          'Comfortable walking shoes and neutral-colored clothing recommended',
          'Binoculars and camera equipment advised for wildlife viewing',
          'Yellow fever vaccination may be required depending on your country of origin',
          preferences.dietary.allergies ? `Please inform guide of allergies: ${preferences.dietary.allergies}` : ''
        ].filter(Boolean)
      };
      resolve(mockItinerary);
    }, 2000);
  });
};
