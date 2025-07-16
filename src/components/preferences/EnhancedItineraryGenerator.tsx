
import { TravelPreferences, TourOutput } from './WizardTypes';
import { enhancedAiService } from '@/services/EnhancedAiService';
import { b2cApiService } from '@/services/B2CApiService';

export const generateEnhancedItinerary = async (preferences: TravelPreferences): Promise<TourOutput> => {
  try {
    console.log('🚀 Generating enhanced creative itinerary with preferences:', preferences);
    
    // Try enhanced AI service first
    const response = await enhancedAiService.generateEnhancedItinerary(preferences);
    
    // Transform enhanced AI response to TourOutput format
    const itinerary: TourOutput = {
      tour_name: response.tour_name || `${preferences.duration}-Day Creative Kenya Safari`,
      summary: response.summary || `Experience Kenya's hidden treasures with this imaginatively crafted ${preferences.duration}-day safari adventure.`,
      itinerary_details: response.itinerary_details || generateCreativeDefaultItinerary(preferences),
      inclusions_suggestions: response.inclusions_suggestions || getEnhancedDefaultInclusions(preferences),
      exclusions_suggestions: response.exclusions_suggestions || getDefaultExclusions(),
      important_notes: response.important_notes || getCreativeDefaultNotes(preferences),
      creativity_metadata: {
        diversity_score: response.diversity_score || 0,
        creativity_elements: response.creativity_elements || [],
        generation_method: 'enhanced_ai'
      }
    };

    console.log('✨ Enhanced itinerary generated successfully with diversity score:', response.diversity_score);
    return itinerary;
  } catch (error) {
    console.error('❌ Enhanced AI service failed, falling back to standard service:', error);
    
    // Fallback to standard B2C service with creative enhancements
    try {
      const fallbackResponse = await b2cApiService.generateItinerary({
        duration: preferences.duration,
        budgetRange: preferences.budgetRange,
        interests: preferences.interests,
        groupSize: preferences.groupSize,
        travelPace: preferences.travelPace
      });

      return {
        tour_name: fallbackResponse.tour_name || `${preferences.duration}-Day Kenya Safari Discovery`,
        summary: fallbackResponse.summary || `Explore Kenya's wonders with this thoughtfully designed ${preferences.duration}-day safari.`,
        itinerary_details: fallbackResponse.itinerary_details || generateCreativeDefaultItinerary(preferences),
        inclusions_suggestions: fallbackResponse.inclusions_suggestions || getEnhancedDefaultInclusions(preferences),
        exclusions_suggestions: fallbackResponse.exclusions_suggestions || getDefaultExclusions(),
        important_notes: fallbackResponse.important_notes || getCreativeDefaultNotes(preferences),
        creativity_metadata: {
          diversity_score: 0,
          creativity_elements: ['Fallback generation'],
          generation_method: 'standard_fallback'
        }
      };

    } catch (fallbackError) {
      console.error('❌ All AI services failed, using creative mock generation:', fallbackError);
      return generateCreativeMockItinerary(preferences);
    }
  }
};

// Enhanced creative mock generation as final fallback
export const generateCreativeMockItinerary = (preferences: TravelPreferences): Promise<TourOutput> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const creativeTourNames = [
        `${preferences.duration}-Day Untold Kenya Stories Safari`,
        `${preferences.duration}-Day Hidden Kingdoms of Kenya`,
        `${preferences.duration}-Day Kenya Through Local Eyes`,
        `${preferences.duration}-Day Secret Safari Pathways`,
        `${preferences.duration}-Day Kenya's Living Legends Tour`
      ];

      const selectedTourName = creativeTourNames[Math.floor(Math.random() * creativeTourNames.length)];

      const mockItinerary: TourOutput = {
        tour_name: selectedTourName,
        summary: `Discover Kenya's authentic soul through this imaginatively crafted ${preferences.duration}-day journey. Perfect for ${preferences.groupSize} ${preferences.groupSize === 1 ? 'traveler' : 'travelers'} seeking ${preferences.travelPace} adventures with genuine local connections and ${preferences.budgetRange} experiences. Your multilingual guide speaks ${preferences.languages.join(' and ')}.`,
        itinerary_details: generateCreativeDefaultItinerary(preferences),
        inclusions_suggestions: getEnhancedDefaultInclusions(preferences),
        exclusions_suggestions: getDefaultExclusions(),
        important_notes: getCreativeDefaultNotes(preferences),
        creativity_metadata: {
          diversity_score: 12,
          creativity_elements: ['Creative naming', 'Local storytelling', 'Cultural immersion'],
          generation_method: 'creative_mock'
        }
      };
      
      console.log('🎨 Creative mock itinerary generated with enhanced elements');
      resolve(mockItinerary);
    }, 2000);
  });
};

const generateCreativeDefaultItinerary = (preferences: TravelPreferences) => {
  const creativeThemes = [
    'Arrival & First Impressions',
    'Wildlife Secrets & Local Legends', 
    'Cultural Heartbeat & Community Stories',
    'Hidden Gems & Off-Path Adventures',
    'Conservation Heroes & Success Stories',
    'Sunrise Encounters & Evening Tales',
    'Authentic Flavors & Traditional Crafts',
    'Final Discoveries & Departure Memories'
  ];

  const uniqueActivities = [
    ['Arrival orientation with local storyteller', 'Welcome ceremony with Maasai warriors', 'Sunset wildlife briefing'],
    ['Dawn game drive with expert tracker', 'Community conservancy visit', 'Traditional weapon throwing lesson'],
    ['Village elder storytelling session', 'Beadwork workshop with local women', 'Traditional cooking class'],
    ['Walking safari with armed ranger', 'Hidden waterfall discovery', 'Rock art exploration'],
    ['Rhino sanctuary behind-scenes tour', 'Anti-poaching unit meeting', 'Tree planting ceremony'],
    ['Hot air balloon safari', 'Bush breakfast preparation', 'Sundowner at secret viewpoint'],
    ['Local market food tour', 'Traditional brewing demonstration', 'Craft cooperative visit'],
    ['Final game drive photography session', 'Farewell blessing ceremony', 'Airport cultural send-off']
  ];

  const creativeLocations = [
    'Nairobi Cultural Center to Masai Mara',
    'Masai Mara Community Conservancy',
    'Local Maasai Village',
    'Samburu National Reserve',
    'Ol Pejeta Conservancy',
    'Lake Nakuru National Park',
    'Aberdare Mountains',
    'Return to Nairobi via Scenic Route'
  ];

  return Array.from({ length: preferences.duration }, (_, index) => ({
    day_number: index + 1,
    theme: creativeThemes[index] || `Discovery Day ${index + 1}`,
    location: creativeLocations[index] || `Kenya Safari Location ${index + 1}`,
    activities: uniqueActivities[index] || ['Game drive', 'Cultural visit', 'Local interaction'],
    accommodation_suggestion: generateCreativeAccommodation(preferences.budgetRange, index),
    meals: generateCreativeMeals(index),
    unique_experiences: [
      'Local guide storytelling',
      'Authentic cultural interaction',
      'Conservation impact experience'
    ],
    flexibility_options: [
      'Weather alternative available',
      'Extended experience option',
      'Photography focus upgrade'
    ],
    travel_notes: index === 0 ? `Entry point: ${preferences.travel?.portOfEntry || 'Jomo Kenyatta International Airport'}` : undefined,
    pickup_details: index === 0 && preferences.travel?.airportPickup ? {
      time: preferences.travel.pickupTime || 'Upon arrival',
      location: preferences.travel.pickupLocation || 'Airport arrivals hall'
    } : undefined,
    cultural_highlight: generateCulturalHighlight(index),
    conservation_story: generateConservationStory(index)
  }));
};

const generateCreativeAccommodation = (budgetRange: string, dayIndex: number): string => {
  const luxuryOptions = [
    'Exclusive tented camp with panoramic views',
    'Boutique eco-lodge with local architecture',
    'Private conservancy camp with wildlife access',
    'Heritage lodge with cultural storytelling',
    'Riverside luxury camp with hippo sounds',
    'Mountain retreat with sunrise views',
    'Community-owned luxury lodge',
    'Traditional-modern fusion accommodation'
  ];

  const midRangeOptions = [
    'Comfortable safari lodge with local character',
    'Eco-friendly camp with authentic design',
    'Community partnership lodge',
    'Scenic tented camp with wildlife proximity',
    'Cultural heritage lodge',
    'Riverside camp with natural sounds',
    'Conservation-focused accommodation',
    'Traditional-style comfortable lodge'
  ];

  const budgetOptions = [
    'Authentic community homestay',
    'Budget safari camp with local charm',
    'Eco-camping with cultural experiences',
    'Local guesthouse with family meals',
    'Community-run budget lodge',
    'Camping under African stars',
    'Basic but authentic safari experience',
    'Local family accommodation'
  ];

  let options = budgetOptions;
  if (budgetRange === 'luxury') options = luxuryOptions;
  else if (budgetRange === 'mid-range') options = midRangeOptions;

  return options[dayIndex % options.length];
};

const generateCreativeMeals = (dayIndex: number): string[] => {
  const creativeMealOptions = [
    ['Welcome breakfast with local fruits', 'Traditional lunch in village', 'Campfire dinner with stories'],
    ['Bush breakfast at sunrise', 'Picnic lunch by river', 'Farewell dinner with local music'],
    ['Cultural breakfast experience', 'Community lunch sharing', 'Traditional feast with dancing'],
    ['Dawn coffee and pastries', 'Authentic local restaurant', 'Sundowner dinner with local wine'],
    ['Conservation center breakfast', 'Farm-to-table lunch', 'Star-gazing dinner experience'],
    ['Early morning tea and snacks', 'Riverside lunch preparation', 'Cultural cooking class dinner'],
    ['Local market breakfast tour', 'Traditional brewing lunch', 'Farewell feast preparation'],
    ['Final sunrise breakfast', 'Airport departure snacks', 'Cultural farewell ceremony']
  ];

  return creativeMealOptions[dayIndex] || ['Breakfast', 'Lunch', 'Dinner'];
};

const generateCulturalHighlight = (dayIndex: number): string => {
  const highlights = [
    'Welcome blessing from village elder',
    'Traditional warrior dance demonstration',
    'Women\'s cooperative beadwork session',
    'Storytelling under the baobab tree',
    'Traditional medicine plant walk',
    'Local music and instrument making',
    'Community development project visit',
    'Farewell blessing and gift exchange'
  ];

  return highlights[dayIndex] || 'Cultural interaction with local community';
};

const generateConservationStory = (dayIndex: number): string => {
  const stories = [
    'Community conservancy success story',
    'Anti-poaching efforts and wildlife protection',
    'Local conservation heroes recognition',
    'Habitat restoration project impact',
    'Human-wildlife conflict resolution',
    'Conservation education program visit',
    'Wildlife corridor protection efforts',
    'Future conservation vision sharing'
  ];

  return stories[dayIndex] || 'Local conservation initiative';
};

const getEnhancedDefaultInclusions = (preferences: TravelPreferences) => [
  'All national park and conservancy entrance fees',
  'Expert local guide with storytelling abilities (fluent in ' + preferences.languages.join(', ') + ')',
  'Authentic cultural experiences and community visits',
  'Conservation project visits and educational talks',
  'All accommodation with local character as specified',
  'Traditional and international meal experiences',
  'Transportation in well-equipped 4WD safari vehicle',
  'Local craft workshops and cultural demonstrations',
  'Photography guidance and optimal viewing positions',
  'Flexible scheduling for spontaneous wildlife encounters',
  'Community support contributions and sustainable tourism practices'
];

const getDefaultExclusions = () => [
  'International flights and travel insurance',
  'Kenya visa fees and required vaccinations',
  'Personal shopping, souvenirs, and craft purchases',
  'Alcoholic beverages (unless specifically included)',
  'Gratuities for guides, drivers, and lodge staff',
  'Optional activity upgrades and extensions',
  'Personal photography equipment and accessories',
  'International phone calls and internet usage',
  'Laundry services and personal items'
];

const getCreativeDefaultNotes = (preferences: TravelPreferences) => [
  'This itinerary celebrates Kenya\'s authentic culture while supporting local communities',
  'Wildlife viewing depends on natural behavior patterns and seasonal movements',
  'Cultural experiences respect local traditions and provide meaningful exchanges',
  'Weather variations may create unique opportunities for alternative discoveries',
  'Conservation visits demonstrate real impact of responsible tourism',
  'Photography opportunities are enhanced with local knowledge and optimal timing',
  preferences.budgetRange === 'luxury' ? 
    'Exclusive access to private conservancies provides intimate wildlife encounters' :
    preferences.budgetRange === 'budget' ?
    'Community-based experiences directly support local development and conservation' :
    'Balanced approach combines authentic experiences with comfortable accommodations',
  'Flexible "Kenyan time" scheduling allows for unhurried, quality experiences',
  preferences.dietary?.allergies ? `Special dietary requirements accommodated: ${preferences.dietary.allergies}` : '',
  'Emergency protocols and communication systems ensure safety and peace of mind'
].filter(Boolean);
