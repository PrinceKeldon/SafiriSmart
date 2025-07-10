import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WizardProgress } from './WizardProgress';
import WizardSteps from './WizardSteps';
import ItineraryDisplay from './ItineraryDisplay';
import LeadCaptureForm from './LeadCaptureForm';
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
  const [showLeadCaptureForm, setShowLeadCaptureForm] = useState(false);

  const totalSteps = 9; // Simplified to 9 steps

  console.log('PreferenceWizard: Current step:', currentStep);

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
    }
  };

  const handleBack = () => {
    if (showLeadCaptureForm) {
      setShowLeadCaptureForm(false);
      setShowItineraryDisplay(true);
    } else if (showItineraryDisplay) {
      setShowItineraryDisplay(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleItineraryComplete = () => {
    console.log('PreferenceWizard: Moving from itinerary to lead capture form');
    setShowItineraryDisplay(false);
    setShowLeadCaptureForm(true);
  };

  const handleItineraryBack = () => {
    setShowItineraryDisplay(false);
  };

  const handleFinalComplete = (result: any) => {
    console.log('PreferenceWizard: Final completion with result:', result);
    onComplete({
      preferences,
      schedule,
      travel,
      dietary,
      userDetails
    });
  };

  if (showLeadCaptureForm) {
    // Create a mock itinerary for the lead capture form
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
        activities: [
          i === 0 ? 'Airport Transfer' : 'Game Drive',
          i === 0 ? 'Welcome and transfer to lodge' : 'Wildlife viewing experience'
        ],
        accommodation: `Safari Lodge ${i + 1}`,
        meals: ['Breakfast', 'Lunch', 'Dinner']
      }))
    };

    return (
      <LeadCaptureForm
        preferences={preferences}
        schedule={schedule}
        travel={travel}
        dietary={dietary}
        itinerary={mockItinerary}
        onComplete={handleFinalComplete}
        onBack={handleBack}
      />
    );
  }

  if (showItineraryDisplay) {
    // Create a mock itinerary for display - fix the activities structure
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
        activities: [
          i === 0 ? 'Airport Transfer' : 'Game Drive',
          i === 0 ? 'Welcome and transfer to lodge' : 'Wildlife viewing experience'
        ],
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
        userDetails={userDetails}
        onBack={handleItineraryBack}
        onComplete={handleItineraryComplete}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <WizardProgress currentStep={currentStep} steps={steps} />
      
      <Card className="mt-8">
        <CardContent className="p-8">
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
            onComplete={handleFinalComplete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferenceWizard;
