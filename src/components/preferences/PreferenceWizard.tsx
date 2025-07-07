
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WizardProgress } from './WizardProgress';
import WizardSteps from './WizardSteps';
import { WizardNavigation } from './WizardNavigation';
import { generateItinerary } from './ItineraryGenerator';

interface PreferenceWizardProps {
  onComplete: (data: {
    preferences: any;
    schedule: any;
    travel: any;
    dietary: any;
    selectedPackages: string[];
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
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [showItineraryGenerator, setShowItineraryGenerator] = useState(false);

  // Update total steps to include operator selection
  const totalSteps = 10;

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep === 9) {
      // After dietary step, show itinerary generator
      setShowItineraryGenerator(true);
    } else if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete the wizard
      onComplete({
        preferences,
        schedule,
        travel,
        dietary,
        selectedPackages
      });
    }
  };

  const handleBack = () => {
    if (showItineraryGenerator) {
      setShowItineraryGenerator(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleItineraryComplete = () => {
    setShowItineraryGenerator(false);
    setCurrentStep(10); // Go to operator selection step
  };

  if (showItineraryGenerator) {
    // Show a simple loading state for itinerary generation
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <h3 className="text-lg font-semibold">Generating Your Safari Itinerary</h3>
              <p className="text-gray-600">Please wait while we create your personalized safari experience...</p>
              <button
                onClick={handleItineraryComplete}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Continue to Operator Selection
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
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
    { id: 9, title: 'Dietary Needs', description: 'Any dietary requirements we should know about?' },
    { id: 10, title: 'Choose Operators', description: 'Select safari operators for your inquiry' }
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
            selectedPackages={selectedPackages}
            onPreferenceChange={handlePreferenceChange}
            onScheduleChange={setSchedule}
            onTravelChange={setTravel}
            onDietaryChange={setDietary}
            onPackageSelectionChange={setSelectedPackages}
            onNext={handleNext}
            onBack={handleBack}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferenceWizard;
