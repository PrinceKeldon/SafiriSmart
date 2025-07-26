
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
      userDetails
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
        activities = ['Airport pickup and transfer', 'Welcome briefing', 'First game drive', 'Evening at lodge'];
      } else if (isLastDay) {
        theme = 'Final Safari Moments & Departure';
        activities = ['Morning game drive', 'Packing and checkout', 'Transfer to airport', 'Departure'];
      } else if (dayInDestination === 1 && !isFirstDay) {
        theme = `Journey to ${destination.name}`;
        activities = ['Transfer to new destination', 'Check-in and lunch', ...destination.activities.slice(0, 2)];
      } else {
        theme = `${destination.name} Adventure - Day ${dayInDestination}`;
        activities = destination.activities.slice(0, 3);
      }

      return {
        day_number: dayNumber,
        theme,
        location: destination.name,
        activities,
        accommodation_suggestion: `${budgetRange === 'luxury' ? 'Premium safari lodge' : budgetRange === 'budget' ? 'Safari camp' : 'Comfortable safari lodge'} near ${destination.name}`,
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        unique_experiences: [destination.note],
        cultural_highlight: interests.includes('cultural') ? 'Local community interaction and traditional experiences' : undefined,
        conservation_story: interests.includes('conservation') ? 'Learn about local wildlife conservation efforts' : undefined
      };
    });

    // Generate contextual inclusions based on interests
    const baseInclusions = [
      'All national park and conservancy entrance fees',
      'Professional safari guide services',
      'Transportation in 4WD safari vehicle with pop-up roof',
      'All accommodation as specified',
      'All meals as outlined in itinerary',
      'Bottled water during game drives'
    ];

    const contextualInclusions = [];
    if (interests.includes('cultural')) contextualInclusions.push('Traditional village visits and cultural performances');
    if (interests.includes('photography')) contextualInclusions.push('Photography guidance and optimal timing for shoots');
    if (interests.includes('bird-watching')) contextualInclusions.push('Specialized bird watching guides and equipment');
    if (interests.includes('beach')) contextualInclusions.push('Beach activities and water sports equipment');
    if (interests.includes('adventure')) contextualInclusions.push('Adventure activity equipment and safety gear');

    const smartNotes = [
      `🎯 This ${duration}-day itinerary is intelligently crafted based on your selected interests: ${interests.map(i => i.replace('-', ' ')).join(', ')}`,
      '💡 PLANNING GUIDE: These suggestions serve as a conversation starter with tour operators',
      '🤝 Please discuss and customize all details with your chosen operator to match their current offerings',
      `👥 Designed for ${groupSize} traveler${groupSize > 1 ? 's' : ''} with a ${budgetRange} budget preference`,
      '🌍 All suggested destinations are real locations in Kenya\'s tourism circuit',
      '📋 Activities reflect your interests but are subject to operator availability and seasonal conditions',
      '⚡ Flexible itinerary - operators can adjust based on weather, wildlife movements, and your preferences'
    ];

    if (interests.length > 3) {
      smartNotes.push('🎨 Multi-interest itinerary - operators may suggest focusing on fewer interests for deeper experiences');
    }

    return {
      tour_name: `${duration}-Day ${interests.slice(0, 2).map(i => i.replace('-', ' ')).join(' & ').replace(/\b\w/g, l => l.toUpperCase())} Kenya Experience`,
      summary: `An intelligently designed ${duration}-day Kenya adventure for ${groupSize} traveler${groupSize > 1 ? 's' : ''}, featuring ${selectedDestinations.map(d => d.name).slice(0, 2).join(' and ')} with activities tailored to your interests: ${interests.map(i => i.replace('-', ' ')).join(', ')}. This ${budgetRange} tier experience serves as your planning guide for discussions with operators.`,
      itinerary_details: itineraryDetails,
      inclusions_suggestions: [...baseInclusions, ...contextualInclusions],
      exclusions_suggestions: [
        'International flights and travel insurance',
        'Kenya visa fees and required vaccinations',
        'Personal shopping and souvenirs',
        'Alcoholic beverages (unless specifically included)',
        'Gratuities for guides, drivers, and lodge staff',
        'Optional activity upgrades and extensions'
      ],
      important_notes: smartNotes,
      creativity_metadata: {
        diversity_score: interests.length * 15,
        creativity_elements: ['Interest-matched destinations', 'Real Kenya locations', 'Activity-based suggestions'],
        generation_method: 'smart_mock_with_interest_mapping'
      }
    };
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
      itinerary: {
        title: `${preferences.duration}-Day Safari Adventure`,
        overview: `A personalized ${preferences.duration}-day safari experience for ${preferences.groupSize} travelers`,
        duration: preferences.duration,
        estimatedCost: {
          amount: preferences.budgetRange === 'budget' ? 2000 : preferences.budgetRange === 'mid-range' ? 4000 : 8000,
          currency: 'USD'
        },
        itinerary_details: Array.from({ length: preferences.duration }, (_, i) => ({
          day: i + 1,
          location: i === 0 ? 'Arrival' : 'Safari Location',
          activities: [
            i === 0 ? 'Airport Transfer' : 'Game Drive',
            i === 0 ? 'Welcome and transfer to lodge' : 'Wildlife viewing experience'
          ],
          accommodation: `Safari Lodge ${i + 1}`,
          meals: ['Breakfast', 'Lunch', 'Dinner']
        }))
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
