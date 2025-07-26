import { TravelPreferences, TourOutput } from './WizardTypes';
import { packageMatchingService } from '@/services/PackageMatchingService';

interface SmartDestination {
  name: string;
  highlights: string[];
  bestFor: string[];
  duration: string;
  activities: string[];
}

interface SmartSuggestions {
  destinations: SmartDestination[];
  packageMatches: any[];
  totalScore: number;
}

export const generateSmartItinerary = async (preferences: TravelPreferences): Promise<TourOutput> => {
  try {
    console.log('🧠 Generating smart itinerary with package matching...', preferences);
    
    // Get matching packages from the system
    const packageMatches = await packageMatchingService.getMatchingPackages(preferences);
    
    // Generate smart destination recommendations
    const smartSuggestions = generateSmartDestinations(preferences, packageMatches);
    
    // Create enhanced itinerary with smart suggestions
    const itinerary: TourOutput = {
      tour_name: generateSmartTourName(preferences, smartSuggestions),
      summary: generateSmartSummary(preferences, smartSuggestions),
      itinerary_details: generateDetailedItinerary(preferences, smartSuggestions),
      inclusions_suggestions: getSmartInclusions(preferences, packageMatches),
      exclusions_suggestions: getStandardExclusions(),
      important_notes: getSmartImportantNotes(preferences, packageMatches),
      creativity_metadata: {
        diversity_score: smartSuggestions.totalScore,
        creativity_elements: ['Package-matched destinations', 'Operator-verified activities', 'Budget-optimized suggestions'],
        generation_method: 'smart_ai_with_package_matching'
      }
    };

    console.log('✨ Smart itinerary generated with', packageMatches.length, 'package matches');
    return itinerary;
  } catch (error) {
    console.error('❌ Smart itinerary generation failed:', error);
    // Fallback to basic generation
    return generateFallbackItinerary(preferences);
  }
};

const generateSmartDestinations = (preferences: TravelPreferences, packageMatches: any[]): SmartSuggestions => {
  const destinationMap = new Map<string, SmartDestination>();
  let totalScore = 0;

  // Extract destinations from matching packages
  packageMatches.forEach(match => {
    const locations = match.package.included_locations || [];
    const activities = match.package.included_activities || [];
    
    locations.forEach((location: string) => {
      if (!destinationMap.has(location)) {
        destinationMap.set(location, {
          name: location,
          highlights: [],
          bestFor: [],
          duration: estimateLocationDuration(location, preferences.duration),
          activities: []
        });
      }
      
      const dest = destinationMap.get(location)!;
      dest.activities.push(...activities);
      dest.bestFor.push(...match.matchReasons);
      totalScore += match.matchScore;
    });
  });

  // Add interest-based destinations if no package matches
  if (destinationMap.size === 0) {
    addInterestBasedDestinations(destinationMap, preferences);
  }

  // Enhance destinations with detailed information
  const enhancedDestinations = Array.from(destinationMap.values()).map(dest => ({
    ...dest,
    highlights: generateDestinationHighlights(dest.name, preferences.interests),
    bestFor: [...new Set(dest.bestFor)],
    activities: [...new Set(dest.activities)]
  }));

  return {
    destinations: enhancedDestinations.slice(0, Math.ceil(preferences.duration / 2)),
    packageMatches,
    totalScore
  };
};

const addInterestBasedDestinations = (destinationMap: Map<string, SmartDestination>, preferences: TravelPreferences) => {
  const interestDestinations: Record<string, string[]> = {
    'wildlife-safari': ['Masai Mara National Reserve', 'Amboseli National Park', 'Tsavo East National Park'],
    'cultural': ['Masai Mara Community Conservancies', 'Local Maasai Villages', 'Cultural Centers'],
    'photography': ['Masai Mara National Reserve', 'Lake Nakuru National Park', 'Amboseli National Park'],
    'bird-watching': ['Lake Nakuru National Park', 'Lake Naivasha', 'Aberdare National Park'],
    'beach': ['Diani Beach', 'Watamu Marine Park', 'Malindi'],
    'adventure': ['Mount Kenya Region', 'Hell\'s Gate National Park', 'Aberdare Mountains'],
    'conservation': ['Ol Pejeta Conservancy', 'David Sheldrick Elephant Orphanage', 'Giraffe Centre']
  };

  preferences.interests.forEach(interest => {
    const destinations = interestDestinations[interest] || [];
    destinations.forEach(dest => {
      if (!destinationMap.has(dest)) {
        destinationMap.set(dest, {
          name: dest,
          highlights: [],
          bestFor: [interest],
          duration: estimateLocationDuration(dest, preferences.duration),
          activities: []
        });
      }
    });
  });
};

const generateDestinationHighlights = (destination: string, interests: string[]): string[] => {
  const highlightMap: Record<string, string[]> = {
    'Masai Mara National Reserve': [
      'Great Migration spectacle (July-October)',
      'Big Five wildlife encounters',
      'Maasai cultural experiences',
      'Hot air balloon safaris',
      'World-class photography opportunities'
    ],
    'Amboseli National Park': [
      'Iconic Mount Kilimanjaro backdrop',
      'Large elephant herds',
      'Authentic Maasai culture',
      'Diverse bird species (400+)',
      'Stunning sunrise and sunset views'
    ],
    'Lake Nakuru National Park': [
      'Famous flamingo populations',
      'Rhino sanctuary success story',
      'Over 450 bird species',
      'Scenic lake views',
      'Easy game viewing'
    ],
    'Diani Beach': [
      'Pristine white sand beaches',
      'Crystal clear waters',
      'Water sports activities',
      'Coral reef snorkeling',
      'Beach relaxation'
    ]
  };

  return highlightMap[destination] || [
    'Unique wildlife experiences',
    'Scenic natural beauty',
    'Cultural interactions',
    'Photography opportunities'
  ];
};

const estimateLocationDuration = (location: string, totalDuration: number): string => {
  const durationMap: Record<string, number> = {
    'Masai Mara National Reserve': Math.ceil(totalDuration * 0.4),
    'Amboseli National Park': Math.ceil(totalDuration * 0.3),
    'Lake Nakuru National Park': Math.min(2, Math.ceil(totalDuration * 0.2)),
    'Diani Beach': Math.ceil(totalDuration * 0.3)
  };

  const days = durationMap[location] || Math.ceil(totalDuration / 3);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

const generateSmartTourName = (preferences: TravelPreferences, suggestions: SmartSuggestions): string => {
  const mainDestination = suggestions.destinations[0]?.name || 'Kenya';
  const primaryInterest = preferences.interests[0] || 'safari';
  
  const creativeNames = [
    `${preferences.duration}-Day ${mainDestination.split(' ')[0]} ${primaryInterest.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Adventure`,
    `Discover ${mainDestination}: ${preferences.duration}-Day Premium Experience`,
    `${preferences.duration}-Day ${preferences.budgetRange.charAt(0).toUpperCase() + preferences.budgetRange.slice(1)} Kenya Explorer`,
    `Tailored ${preferences.duration}-Day Kenya Journey: ${mainDestination} & Beyond`
  ];

  return creativeNames[Math.floor(Math.random() * creativeNames.length)];
};

const generateSmartSummary = (preferences: TravelPreferences, suggestions: SmartSuggestions): string => {
  const destinationNames = suggestions.destinations.map(d => d.name).slice(0, 3);
  const matchedPackages = suggestions.packageMatches.length;
  
  let summary = `Experience Kenya's finest with this intelligently crafted ${preferences.duration}-day journey`;
  
  if (destinationNames.length > 0) {
    summary += ` featuring ${destinationNames.join(', ')}`;
  }
  
  summary += `. Perfect for ${preferences.groupSize} ${preferences.groupSize === 1 ? 'traveler' : 'travelers'} seeking ${preferences.travelPace} adventures within a ${preferences.budgetRange} budget.`;
  
  if (matchedPackages > 0) {
    summary += ` This itinerary incorporates insights from ${matchedPackages} verified operator package${matchedPackages === 1 ? '' : 's'} in our system.`;
  }
  
  return summary;
};

const generateDetailedItinerary = (preferences: TravelPreferences, suggestions: SmartSuggestions) => {
  const destinations = suggestions.destinations;
  const daysPerDestination = Math.ceil(preferences.duration / Math.max(destinations.length, 1));
  
  return Array.from({ length: preferences.duration }, (_, index) => {
    const dayNumber = index + 1;
    const destIndex = Math.floor(index / daysPerDestination);
    const destination = destinations[destIndex] || destinations[0] || {
      name: 'Kenya Safari Destination',
      highlights: ['Wildlife viewing', 'Cultural experiences'],
      activities: ['Game drive', 'Nature walk'],
      duration: '1 day'
    };
    
    const isFirstDay = index === 0;
    const isLastDay = index === preferences.duration - 1;
    
    return {
      day_number: dayNumber,
      theme: isFirstDay ? 'Arrival & First Encounters' : 
             isLastDay ? 'Final Adventures & Departure' :
             `${destination.name} Discovery`,
      location: destination.name,
      activities: generateDayActivities(destination, preferences.interests, isFirstDay, isLastDay),
      accommodation_suggestion: generateAccommodationSuggestion(destination.name, preferences.budgetRange, suggestions.packageMatches),
      meals: generateMealSuggestions(dayNumber, preferences.budgetRange),
      unique_experiences: destination.highlights.slice(0, 2),
      flexibility_options: [
        'Weather-dependent alternatives available',
        'Activity timing can be adjusted',
        'Optional extensions possible'
      ],
      travel_notes: isFirstDay ? `Entry point: ${preferences.travel?.portOfEntry || 'Jomo Kenyatta International Airport'}` : undefined,
      pickup_details: isFirstDay && preferences.travel?.airportPickup ? {
        time: preferences.travel.pickupTime || 'Upon arrival',
        location: preferences.travel.pickupLocation || 'Airport arrivals hall'
      } : undefined,
      cultural_highlight: generateCulturalHighlight(destination.name),
      conservation_story: generateConservationStory(destination.name)
    };
  });
};

const generateDayActivities = (destination: any, interests: string[], isFirstDay: boolean, isLastDay: boolean): string[] => {
  if (isFirstDay) return ['Airport pickup and transfer', 'Arrival briefing', 'Welcome lunch', 'Afternoon game drive'];
  if (isLastDay) return ['Final game drive', 'Departure preparations', 'Airport transfer'];
  
  return destination.activities.length > 0 ? destination.activities.slice(0, 3) : ['Game drive', 'Wildlife viewing', 'Cultural visit'];
};

const generateAccommodationSuggestion = (location: string, budgetRange: string, packageMatches: any[]): string => {
  const tierMap = {
    luxury: 'Premium safari lodge with panoramic views',
    'mid-range': 'Comfortable safari camp with authentic design',
    budget: 'Authentic community-based accommodation'
  };
  
  return tierMap[budgetRange as keyof typeof tierMap] || 'Safari accommodation';
};

const generateMealSuggestions = (dayNumber: number, budgetRange: string): string[] => {
  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  if (budgetRange === 'luxury') {
    return meals.map(meal => `Gourmet ${meal.toLowerCase()}`);
  }
  return meals;
};

const generateCulturalHighlight = (location: string): string => {
  const highlights: Record<string, string> = {
    'Masai Mara National Reserve': 'Traditional Maasai warrior dance and village visit',
    'Amboseli National Park': 'Maasai community interaction and beadwork demonstration',
    'Lake Nakuru National Park': 'Local community conservation project visit'
  };
  
  return highlights[location] || 'Local community cultural interaction';
};

const generateConservationStory = (location: string): string => {
  const stories: Record<string, string> = {
    'Masai Mara National Reserve': 'Community conservancy success in wildlife protection',
    'Amboseli National Park': 'Human-elephant conflict resolution initiatives',
    'Lake Nakuru National Park': 'Rhino sanctuary and breeding program success'
  };
  
  return stories[location] || 'Local wildlife conservation efforts';
};

const generateFallbackItinerary = (preferences: TravelPreferences): TourOutput => {
  return {
    tour_name: `${preferences.duration}-Day Kenya Safari Experience`,
    summary: `A carefully planned ${preferences.duration}-day safari adventure designed for ${preferences.groupSize} travelers.`,
    itinerary_details: [], // Basic fallback implementation
    inclusions_suggestions: [],
    exclusions_suggestions: [],
    important_notes: [],
    creativity_metadata: {
      diversity_score: 5,
      creativity_elements: ['Fallback generation'],
      generation_method: 'basic_fallback'
    }
  };
};

const getSmartInclusions = (preferences: TravelPreferences, packageMatches: any[]): string[] => {
  const baseInclusions = [
    'All national park and conservancy entrance fees',
    `Professional safari guide fluent in ${preferences.languages.join(' and ')}`,
    'Transportation in well-equipped 4WD safari vehicle with pop-up roof',
    'All accommodation as specified in itinerary',
    'Meals as outlined in daily schedule',
    'Bottled water during game drives',
    'Airport transfers as specified'
  ];

  // Add package-specific inclusions if available
  if (packageMatches.length > 0) {
    baseInclusions.push('Verified operator services based on system matching');
    packageMatches[0].package.included_activities?.forEach((activity: string) => {
      if (!baseInclusions.some(inc => inc.toLowerCase().includes(activity.toLowerCase()))) {
        baseInclusions.push(activity);
      }
    });
  }

  return baseInclusions;
};

const getStandardExclusions = (): string[] => [
  'International flights and travel insurance',
  'Kenya visa fees and required vaccinations',
  'Personal shopping and souvenirs',
  'Alcoholic beverages (unless specifically included)',
  'Gratuities for guides, drivers, and lodge staff',
  'Optional activity upgrades and extensions',
  'Personal equipment and cameras',
  'Laundry services and personal items'
];

const getSmartImportantNotes = (preferences: TravelPreferences, packageMatches: any[]): string[] => {
  const notes = [
    '🎯 IMPORTANT: This itinerary represents intelligent suggestions based on your preferences and available operator packages in our system.',
    '💡 These suggestions are NOT final bookings but serve as a detailed planning guide to discuss with your chosen tour operator.',
    '🤝 Please review, discuss, and adjust this itinerary with your selected operator to match your exact needs and their current offerings.',
    '📊 Package matching: We analyzed verified operator packages to ensure realistic and available experiences.',
    '🌦️ Weather and wildlife movements may create opportunities for alternative discoveries.',
    '📸 Photography opportunities are enhanced with operator knowledge of optimal timing and locations.',
  ];

  if (packageMatches.length > 0) {
    notes.push(`✅ Based on ${packageMatches.length} matching operator package${packageMatches.length === 1 ? '' : 's'} currently available in our system.`);
    notes.push(`💰 Estimated daily cost insights available from ${packageMatches[0].operatorName || 'verified operators'}.`);
  }

  if (preferences.budgetRange === 'luxury') {
    notes.push('🌟 Luxury tier: Premium accommodations and exclusive experiences included in suggestions.');
  } else if (preferences.budgetRange === 'budget') {
    notes.push('💚 Budget-conscious: Community-based tourism and value-focused experiences prioritized.');
  }

  notes.push('⏰ Flexible scheduling allows for "Kenyan time" approach to unhurried, quality experiences.');
  
  if (preferences.dietary?.allergies) {
    notes.push(`🍽️ Dietary requirements noted: ${preferences.dietary.allergies} - discuss with operator for meal planning.`);
  }

  return notes;
};
