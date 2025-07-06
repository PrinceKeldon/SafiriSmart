
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import WizardProgress from './WizardProgress';
import WizardSteps from './WizardSteps';
import WizardNavigation from './WizardNavigation';
import ItineraryGenerator from './ItineraryGenerator';

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
    return (
      <ItineraryGenerator
        preferences={preferences}
        schedule={schedule}
        travel={travel}
        dietary={dietary}
        onComplete={handleItineraryComplete}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />
      
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
