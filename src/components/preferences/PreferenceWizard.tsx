
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItineraryDisplay } from './ItineraryDisplay';
import { useForm } from 'react-hook-form';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { WizardSteps } from './WizardSteps';
import { LoadingState } from './LoadingState';
import { generateItinerary } from './ItineraryGenerator';
import { 
  TravelPreferences, 
  TourOutput, 
  initialPreferences, 
  steps 
} from './WizardTypes';

export const PreferenceWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<TravelPreferences>(initialPreferences);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<TourOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: preferences
  });

  // Sync form changes with preferences state - only for specific form-based steps if needed
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value && currentStep <= 6) { // Only sync for steps that might use form
        console.log('Form value changed:', value);
        // Handle any form-specific updates here if needed
      }
    });
    return () => subscription.unsubscribe();
  }, [form, currentStep]);

  const updatePreferences = (updates: Partial<TravelPreferences>) => {
    console.log('Updating preferences with:', updates);
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      console.log('New preferences state:', newPreferences);
      return newPreferences;
    });
  };

  const nextStep = () => {
    console.log('Moving to next step from:', currentStep);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      console.log('New step:', currentStep + 1);
    }
  };

  const prevStep = () => {
    console.log('Moving to previous step from:', currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log('New step:', currentStep - 1);
    }
  };

  const handleComplete = async () => {
    console.log('Collected Travel Preferences:', preferences);
    setIsGenerating(true);
    setError(null);
    
    try {
      const itinerary = await generateItinerary(preferences);
      setGeneratedItinerary(itinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToPreferences = () => {
    setGeneratedItinerary(null);
    setError(null);
    setCurrentStep(1);
  };

  // Show loading state while generating
  if (isGenerating) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Generating Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleBackToPreferences}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show itinerary if generated
  if (generatedItinerary) {
    return (
      <ItineraryDisplay 
        itinerary={generatedItinerary}
        preferences={preferences}
        onBackToPreferences={handleBackToPreferences}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <WizardProgress currentStep={currentStep} steps={steps} />

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">
            Step {currentStep} of {steps.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WizardSteps
            currentStep={currentStep}
            preferences={preferences}
            updatePreferences={updatePreferences}
            form={form}
          />
        </CardContent>
      </Card>

      <WizardNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={prevStep}
        onNext={nextStep}
        onComplete={handleComplete}
      />
    </div>
  );
};
