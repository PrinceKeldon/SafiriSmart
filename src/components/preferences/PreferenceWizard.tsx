import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WizardProgress } from './WizardProgress';
import WizardSteps from './WizardSteps';
import ItineraryDisplay from './ItineraryDisplay';
import { OperatorSelectionModal } from './OperatorSelectionModal';
import { UserDetails, steps } from './WizardTypes';

interface PreferenceWizardProps {
  onComplete: (data: {
    preferences: any;
    schedule: any;
    travel: any;
    dietary: any;
    userDetails: UserDetails;
    fullItinerary?: any;
  }) => void;
}

const PreferenceWizard: React.FC<PreferenceWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState({
    interests: [],
    duration: 7,
    groupSize: 2,
    budgetRange: 'mid-range',
    travelPace: 'moderate',
    languages: ['English']
  });
  const [schedule, setSchedule] = useState({
    startDate: null,
    endDate: null,
    flexible: true
  });
  const [travel, setTravel] = useState({
    portOfEntry: '',
    airportPickup: false,
    pickupTime: '',
    pickupLocation: ''
  });
  const [dietary, setDietary] = useState({
    mealWishes: '',
    allergies: '',
    specialRequirements: ''
  });
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });
  const [showItineraryDisplay, setShowItineraryDisplay] = useState(false);
  const [showOperatorSelection, setShowOperatorSelection] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

  const totalSteps = 10;

  console.log('PreferenceWizard: Current step:', currentStep, 'showItineraryDisplay:', showItineraryDisplay, 'showOperatorSelection:', showOperatorSelection);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleUserDetailsChange = (details: UserDetails) => {
    setUserDetails(details);
  };

  const handleNext = () => {
    console.log('PreferenceWizard: Moving from step', currentStep);
    
    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 9) {
      // After dietary step (step 9), show itinerary display
      console.log('PreferenceWizard: Moving to itinerary display');
      setShowItineraryDisplay(true);
    } else if (currentStep === 10) {
      // After user details step (step 10), show operator selection
      console.log('PreferenceWizard: Moving from user details to operator selection');
      setShowOperatorSelection(true);
    }
  };

  const handleBack = () => {
    if (showOperatorSelection) {
      // From operator selection back to user details step
      setShowOperatorSelection(false);
      setCurrentStep(10);
    } else if (showItineraryDisplay) {
      // From itinerary display back to step 9
      setShowItineraryDisplay(false);
      setCurrentStep(9);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleItineraryComplete = () => {
    console.log('PreferenceWizard: Moving from itinerary to user details step');
    setShowItineraryDisplay(false);
    setCurrentStep(10); // Move to user details step (Step 10)
  };

  const handleItineraryBack = () => {
    setShowItineraryDisplay(false);
    setCurrentStep(9); // Go back to dietary step
  };

  const handleUserDetailsComplete = () => {
    console.log('PreferenceWizard: User details collected, showing operator selection');
    setShowOperatorSelection(true);
  };

  const handleOperatorSelectionComplete = (selectedOperatorIds: string[]) => {
    console.log('PreferenceWizard: Operator selection complete with operators:', selectedOperatorIds);
    onComplete({
      preferences,
      schedule,
      travel,
      dietary,
      userDetails,
      fullItinerary: generatedItinerary
    });
  };

  const handleOperatorSelectionClose = () => {
    setShowOperatorSelection(false);
    setCurrentStep(10); // Go back to user details step
  };

  const generateSmartMockItinerary = () => {
    const { interests, duration, groupSize, budgetRange } = preferences;
    
    // Map interests to destinations and activities
    const interestDestinations: Record<string, { destinations: string[], activities: string[], notes: string[] }> = {
      'wildlife-safari': {
        destinations: ['Masai Mara National Reserve', 'Amboseli National Park', 'Tsavo East National Park'],
        activities: ['Big Five game drives', 'Wildlife photography', 'Bush walks with guides'],
        notes: [
          'Masai Mara offers the Great Migration spectacle (July-October)',
          'Amboseli provides stunning views of Mount Kilimanjaro',
          'Tsavo East is famous for its red elephants and diverse landscapes'
        ]
      },
      'beach': {
        destinations: ['Diani Beach', 'Watamu Marine Park', 'Malindi'],
        activities: ['Snorkeling and diving', 'Deep sea fishing', 'Beach relaxation', 'Water sports'],
        notes: [
          'Diani Beach features pristine white sand and coral reefs',
          'Watamu is a UNESCO Biosphere Reserve with marine life',
          'Malindi offers historical sites and beautiful beaches'
        ]
      },
      'cultural': {
        destinations: ['Masai Mara Community Conservancies', 'Local Maasai Villages', 'Nairobi Cultural Centers'],
        activities: ['Traditional village visits', 'Cultural dance performances', 'Local craft workshops'],
        notes: [
          'Experience authentic Maasai warrior traditions and lifestyle',
          'Learn about traditional beadwork and local customs',
          'Participate in community conservation projects'
        ]
      },
      'photography': {
        destinations: ['Lake Nakuru National Park', 'Samburu National Reserve', 'Hell\'s Gate National Park'],
        activities: ['Wildlife photography sessions', 'Landscape photography', 'Sunrise/sunset shoots'],
        notes: [
          'Lake Nakuru famous for flamingo populations and scenic views',
          'Samburu offers unique species and dramatic landscapes',
          'Hell\'s Gate provides walking safaris and geothermal features'
        ]
      },
      'bird-watching': {
        destinations: ['Lake Naivasha', 'Aberdare National Park', 'Kakamega Forest'],
        activities: ['Guided bird watching tours', 'Nature walks', 'Bird photography'],
        notes: [
          'Lake Naivasha hosts over 400 bird species',
          'Aberdare offers montane forest birds and wildlife',
          'Kakamega is Kenya\'s last remaining rainforest'
        ]
      },
      'adventure': {
        destinations: ['Mount Kenya Region', 'Hell\'s Gate National Park', 'Aberdare Mountains'],
        activities: ['Mountain climbing', 'Rock climbing', 'Hiking trails', 'Cycling safaris'],
        notes: [
          'Mount Kenya offers challenging climbs and scenic routes',
          'Hell\'s Gate allows walking and cycling among wildlife',
          'Aberdare provides forest hikes and waterfall treks'
        ]
      },
      'conservation': {
        destinations: ['Ol Pejeta Conservancy', 'David Sheldrick Elephant Orphanage', 'Giraffe Centre'],
        activities: ['Conservation project visits', 'Wildlife rehabilitation tours', 'Research participation'],
        notes: [
          'Ol Pejeta is home to the last northern white rhinos',
          'David Sheldrick Orphanage rescues and rehabilitates elephants',
          'Giraffe Centre focuses on endangered Rothschild giraffe conservation'
        ]
      }
    };

    // Select destinations based on user interests
    const selectedDestinations: Array<{name: string, activities: string[], note: string}> = [];
    const usedDestinations = new Set<string>();

    interests.forEach(interest => {
      const interestData = interestDestinations[interest];
      if (interestData) {
        interestData.destinations.forEach((dest, idx) => {
          if (!usedDestinations.has(dest) && selectedDestinations.length < Math.ceil(duration / 2)) {
            selectedDestinations.push({
              name: dest,
              activities: interestData.activities,
              note: interestData.notes[idx] || `Experience ${interest.replace('-', ' ')} activities at ${dest}`
            });
            usedDestinations.add(dest);
          }
        });
      }
    });

    // Ensure we have at least one destination
    if (selectedDestinations.length === 0) {
      selectedDestinations.push({
        name: 'Masai Mara National Reserve',
        activities: ['Game drives', 'Wildlife viewing', 'Cultural experiences'],
        note: 'Kenya\'s most famous safari destination with abundant wildlife'
      });
    }

    // Generate day-by-day itinerary
    const daysPerDestination = Math.ceil(duration / selectedDestinations.length);
    const itineraryDetails = Array.from({ length: duration }, (_, i) => {
      const dayNumber = i + 1;
      const destIndex = Math.floor(i / daysPerDestination);
      const destination = selectedDestinations[destIndex] || selectedDestinations[0];
      const dayInDestination = (i % daysPerDestination) + 1;
      
      const isFirstDay = i === 0;
      const isLastDay = i === duration - 1;
      
      let theme, activities;
      
      if (isFirstDay) {
        theme = 'Arrival & Safari Introduction';
        activities = ['Airport pickup and transfer', 'Welcome briefing and orientation', 'First wildlife encounter game drive', 'Evening at safari lodge with dinner'];
      } else if (isLastDay) {
        theme = 'Final Safari Moments & Departure';
        activities = ['Sunrise game drive - final wildlife viewing', 'Packing and lodge checkout', 'Transfer to airport with scenic route', 'Departure assistance and farewell'];
      } else if (dayInDestination === 1 && !isFirstDay) {
        theme = `Journey to ${destination.name}`;
        activities = [`Scenic transfer to ${destination.name}`, 'Check-in and welcome lunch', ...destination.activities.slice(0, 2)];
      } else {
        theme = `${destination.name} Adventure - Day ${dayInDestination}`;
        activities = destination.activities.slice(0, 4);
      }

      return {
        day_number: dayNumber,
        theme,
        location: destination.name,
        activities,
        accommodation_suggestion: `${budgetRange === 'luxury' ? 'Premium safari lodge with panoramic views' : budgetRange === 'budget' ? 'Authentic safari camp with local character' : 'Comfortable safari lodge with excellent facilities'} in ${destination.name}`,
        meals: ['Continental breakfast', 'Buffet lunch', 'Three-course dinner'],
        unique_experiences: [destination.note, interests.includes('photography') ? 'Professional photography guidance' : 'Wildlife behavior insights'],
        flexibility_options: [
          'Weather-dependent alternatives available',
          'Activity timing adjustable based on wildlife movements',
          'Optional upgrade experiences available'
        ],
        cultural_highlight: interests.includes('cultural') ? 'Traditional community visit and cultural exchange' : 'Local community conservation project visit',
        conservation_story: interests.includes('conservation') ? 'Behind-the-scenes conservation project visit' : 'Learn about local wildlife conservation efforts and success stories',
        travel_notes: isFirstDay ? `Arrival at ${travel.portOfEntry || 'Jomo Kenyatta International Airport'}` : undefined,
        pickup_details: isFirstDay && travel.airportPickup ? {
          time: travel.pickupTime || 'Upon arrival',
          location: travel.pickupLocation || 'Airport arrivals hall'
        } : undefined
      };
    });

    // Enhanced inclusions based on user selections
    const baseInclusions = [
      'All national park and conservancy entrance fees',
      `Professional safari guide services (fluent in ${preferences.languages.join(' and ')})`,
      'Transportation in 4WD safari vehicle with pop-up roof and charging ports',
      'All accommodation as specified in detailed itinerary',
      'All meals as outlined in daily schedule (dietary requirements: ' + (dietary.allergies || 'None specified') + ')',
      'Bottled water during all game drives and transfers',
      'Airport transfers as specified',
      'Emergency communication and first aid kit'
    ];

    const contextualInclusions = [];
    if (interests.includes('cultural')) contextualInclusions.push('Traditional village visits with community guide', 'Cultural performances and demonstrations', 'Authentic craft workshop participation');
    if (interests.includes('photography')) contextualInclusions.push('Photography guidance and optimal positioning', 'Extended time at prime photography locations', 'Sunrise and sunset positioning assistance');
    if (interests.includes('bird-watching')) contextualInclusions.push('Specialized bird watching guides with identification books', 'Binoculars provided during tours', 'Bird checklist and recording assistance');
    if (interests.includes('beach')) contextualInclusions.push('Beach activities and equipment', 'Snorkeling gear and marine life guides', 'Beach transfers and setup');
    if (interests.includes('adventure')) contextualInclusions.push('Adventure activity safety equipment', 'Experienced adventure guides', 'Activity insurance coverage');
    if (interests.includes('conservation')) contextualInclusions.push('Exclusive conservation project visits', 'Meet with conservation experts', 'Participation in conservation activities');

    const smartNotes = [
      `🎯 This ${duration}-day itinerary is intelligently designed based on your selected interests: ${interests.map(i => i.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}`,
      '💡 IMPORTANT: This serves as a comprehensive planning guide and conversation starter with tour operators',
      '🤝 Please review, discuss, and customize all details with your chosen operator to match their current offerings and availability',
      `👥 Specifically designed for ${groupSize} traveler${groupSize > 1 ? 's' : ''} with ${budgetRange} budget preferences and ${preferences.travelPace} travel pace`,
      '🌍 All destinations are verified Kenya safari locations with established tourism infrastructure',
      '📋 Activities and experiences reflect your interests but require operator confirmation for availability',
      '⚡ Flexible daily scheduling allows for wildlife movement adaptations and weather considerations',
      '🏨 Accommodation suggestions match your budget tier and can be upgraded or modified by operators',
      schedule.flexible ? '📅 Flexible travel dates allow operators to suggest optimal timing for wildlife viewing' : '📅 Specific travel dates noted - operators will confirm seasonal considerations',
      dietary.allergies ? `🍽️ Special dietary requirements documented: ${dietary.allergies} - ensure operator can accommodate` : '🍽️ Standard meal preferences - operators can accommodate most dietary requirements',
      travel.airportPickup ? '✈️ Airport pickup service included in planning - operators will confirm transfer details' : '✈️ Airport transfer arrangements to be confirmed with chosen operator'
    ];

    if (interests.length > 3) {
      smartNotes.push('🎨 Multi-interest itinerary - operators may suggest focusing on 2-3 primary interests for optimal experience depth');
    }

    const fullItinerary = {
      tour_name: `${duration}-Day ${interests.slice(0, 2).map(i => i.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(' & ')} Kenya Safari Experience`,
      summary: `An intelligently crafted ${duration}-day Kenya safari adventure for ${groupSize} traveler${groupSize > 1 ? 's' : ''}, featuring ${selectedDestinations.map(d => d.name).slice(0, 3).join(', ')} with personalized activities based on your interests: ${interests.map(i => i.replace('-', ' ')).join(', ')}. This ${budgetRange} tier experience serves as your comprehensive planning guide for detailed discussions with verified tour operators.`,
      itinerary_details: itineraryDetails,
      inclusions_suggestions: [...baseInclusions, ...contextualInclusions],
      exclusions_suggestions: [
        'International flights and comprehensive travel insurance',
        'Kenya visa fees and required vaccinations/medical preparations',
        'Personal shopping, souvenirs, and additional craft purchases',
        'Alcoholic beverages (unless specifically included in package)',
        'Gratuities for guides, drivers, lodge staff, and local communities',
        'Optional activity upgrades, extensions, and premium experiences',
        'Personal photography equipment, cameras, and accessories',
        'International phone calls, internet usage, and communication costs',
        'Laundry services, spa treatments, and personal wellness services'
      ],
      important_notes: smartNotes,
      creativity_metadata: {
        diversity_score: interests.length * 18 + (preferences.travelPace === 'relaxed' ? 5 : preferences.travelPace === 'active' ? 10 : 7),
        creativity_elements: [
          'Interest-matched destinations and activities',
          'Real Kenya locations with verified tourism infrastructure', 
          'Activity-based suggestions tailored to user preferences',
          'Budget-appropriate accommodation and experience suggestions',
          'Dietary and travel logistics integration',
          'Cultural and conservation elements based on interests'
        ],
        generation_method: 'enhanced_smart_mock_with_comprehensive_planning'
      }
    };

    // Store the generated itinerary for later use
    setGeneratedItinerary(fullItinerary);
    return fullItinerary;
  };

  // Show operator selection modal
  if (showOperatorSelection) {
    const travelerData = {
      traveler: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        country: userDetails.country,
        message: userDetails.message
      },
      preferences,
      schedule,
      travel,
      dietary,
      itinerary: generatedItinerary || {
        tour_name: `${preferences.duration}-Day Safari Adventure`,
        summary: `A personalized ${preferences.duration}-day safari experience for ${preferences.groupSize} travelers`,
        duration: preferences.duration,
        estimatedCost: {
          amount: preferences.budgetRange === 'budget' ? 2000 : preferences.budgetRange === 'mid-range' ? 4000 : 8000,
          currency: 'USD'
        },
        itinerary_details: generatedItinerary?.itinerary_details || Array.from({ length: preferences.duration }, (_, i) => ({
          day_number: i + 1,
          theme: i === 0 ? 'Arrival' : 'Safari Adventure',
          location: i === 0 ? 'Arrival Location' : 'Safari Destination',
          activities: [
            i === 0 ? 'Airport Transfer and Welcome' : 'Game Drive and Wildlife Viewing',
            i === 0 ? 'Lodge check-in and orientation' : 'Cultural experiences and photography'
          ],
          accommodation_suggestion: `Safari Lodge ${i + 1}`,
          meals: ['Breakfast', 'Lunch', 'Dinner'],
          unique_experiences: generatedItinerary?.itinerary_details?.[i]?.unique_experiences || ['Wildlife encounters', 'Cultural interactions'],
          cultural_highlight: generatedItinerary?.itinerary_details?.[i]?.cultural_highlight || 'Local community interaction',
          conservation_story: generatedItinerary?.itinerary_details?.[i]?.conservation_story || 'Conservation project visit'
        })),
        inclusions_suggestions: generatedItinerary?.inclusions_suggestions || [
          'All park fees and permits',
          'Professional guide services',
          'Transportation and transfers',
          'Accommodation as specified',
          'Meals as outlined'
        ],
        exclusions_suggestions: generatedItinerary?.exclusions_suggestions || [
          'International flights',
          'Travel insurance',
          'Personal expenses',
          'Gratuities'
        ],
        important_notes: generatedItinerary?.important_notes || [
          'This itinerary serves as a planning guide',
          'All details subject to operator confirmation',
          'Weather and wildlife movements may affect activities'
        ]
      }
    };

    return (
      <OperatorSelectionModal
        isOpen={true}
        onClose={handleOperatorSelectionClose}
        onOperatorsSelected={handleOperatorSelectionComplete}
        travelerData={travelerData}
      />
    );
  }

  // Show itinerary display
  if (showItineraryDisplay) {
    const mockItinerary = generateSmartMockItinerary();

    return (
      <div className="w-full max-w-full px-2 sm:px-4">
        <ItineraryDisplay
          itinerary={mockItinerary}
          preferences={preferences}
          schedule={schedule}
          travel={travel}
          dietary={dietary}
          userDetails={userDetails}
          onBack={handleItineraryBack}
          onComplete={handleItineraryComplete}
        />
      </div>
    );
  }

  // Show wizard steps (including step 10 - user details)
  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      <div className="mb-6 sm:mb-8">
        <WizardProgress currentStep={currentStep} steps={steps} />
      </div>
      
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <WizardSteps
            currentStep={currentStep}
            preferences={preferences}  
            schedule={schedule}
            travel={travel}
            dietary={dietary}
            userDetails={userDetails}
            onPreferenceChange={handlePreferenceChange}
            onScheduleChange={setSchedule}
            onTravelChange={setTravel}
            onDietaryChange={setDietary}
            onUserDetailsChange={handleUserDetailsChange}
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleUserDetailsComplete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferenceWizard;
