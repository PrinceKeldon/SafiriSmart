
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

  // Sync form changes with preferences state
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        setPreferences(prev => ({
          ...prev,
          ...value,
          schedule: {
            ...prev.schedule,
            ...value.schedule,
            flexible: value.schedule?.flexible ?? prev.schedule.flexible
          },
          travel: {
            ...prev.travel,
            ...value.travel
          },
          dietary: {
            ...prev.dietary,
            ...value.dietary
          }
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const updatePreferences = (updates: Partial<TravelPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    // Also update the form values
    Object.keys(updates).forEach(key => {
      form.setValue(key as keyof TravelPreferences, updates[key as keyof TravelPreferences]);
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
