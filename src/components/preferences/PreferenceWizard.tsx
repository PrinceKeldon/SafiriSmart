
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WizardProgress } from './WizardProgress';
import WizardSteps from './WizardSteps';
import ItineraryDisplay from './ItineraryDisplay';

interface PreferenceWizardProps {
  onComplete: (data: {
    preferences: any;
    schedule: any;
    travel: any;
    dietary: any;
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
  const [showItineraryDisplay, setShowItineraryDisplay] = useState(false);

  const totalSteps = 9;

  console.log('PreferenceWizard: Current step:', currentStep);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    console.log('PreferenceWizard: Moving from step', currentStep);
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === totalSteps) {
      // After dietary step (step 9), show itinerary display with lead capture
      console.log('PreferenceWizard: Moving to itinerary display');
      setShowItineraryDisplay(true);
    }
  };

  const handleBack = () => {
    if (showItineraryDisplay) {
      setShowItineraryDisplay(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleItineraryComplete = (result: any) => {
    console.log('PreferenceWizard: Itinerary completed with result:', result);
    onComplete({
      preferences,
      schedule,
      travel,
      dietary
    });
  };

  const handleItineraryBack = () => {
    setShowItineraryDisplay(false);
  };

  if (showItineraryDisplay) {
    // Create a mock itinerary for display
    const mockItinerary = {
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
        activities: [{
          name: i === 0 ? 'Airport Transfer' : 'Game Drive',
          duration: '3-4 hours',
          description: i === 0 ? 'Welcome and transfer to lodge' : 'Wildlife viewing experience'
        }],
        accommodation: `Safari Lodge ${i + 1}`,
        meals: ['Breakfast', 'Lunch', 'Dinner']
      }))
    };

    return (
      <ItineraryDisplay
        itinerary={mockItinerary}
        preferences={preferences}
        schedule={schedule}
        travel={travel}
        dietary={dietary}
        onBack={handleItineraryBack}
        onComplete={handleItineraryComplete}
      />
    );
  }

  const wizardSteps = [
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <WizardProgress currentStep={currentStep} steps={wizardSteps} />
      
      <Card className="mt-8">
        <CardContent className="p-8">
          <WizardSteps
            currentStep={currentStep}
            preferences={preferences}
            schedule={schedule}
            travel={travel}
            dietary={dietary}
            onPreferenceChange={handlePreferenceChange}
            onScheduleChange={setSchedule}
            onTravelChange={setTravel}
            onDietaryChange={setDietary}
            onNext={handleNext}
            onBack={handleBack}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferenceWizard;
