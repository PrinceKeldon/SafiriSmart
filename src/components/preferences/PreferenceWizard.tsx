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

  // Show wizard steps (including step 10 - user details)
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
            onComplete={handleUserDetailsComplete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferenceWizard;
