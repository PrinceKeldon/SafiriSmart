
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DurationStep } from './steps/DurationStep';
import { BudgetStep } from './steps/BudgetStep';
import { InterestsStep } from './steps/InterestsStep';
import { GroupSizeStep } from './steps/GroupSizeStep';
import { TravelPaceStep } from './steps/TravelPaceStep';
import { LanguagesStep } from './steps/LanguagesStep';
import { TravelScheduleForm } from './steps/TravelScheduleForm';
import { ItineraryDisplay } from './ItineraryDisplay';
import { useForm } from 'react-hook-form';

export interface TravelPreferences {
  duration: number;
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
  groupSize: number;
  travelPace: 'relaxed' | 'moderate' | 'active';
  languages: string[];
  schedule: {
    startDate?: Date;
    endDate?: Date;
    flexible: boolean;
  };
  travel: {
    portOfEntry?: string;
    airportPickup: boolean;
    pickupTime?: string;
    pickupLocation?: string;
  };
  dietary: {
    mealWishes?: string;
    allergies?: string;
    specialRequirements?: string;
  };
}

export interface TourOutput {
  tour_name: string;
  summary: string;
  itinerary_details: {
    day_number: number;
    theme: string;
    location: string;
    activities: string[];
    accommodation_suggestion: string;
    meals?: string[];
    travel_notes?: string;
    pickup_details?: {
      time: string;
      location: string;
    };
  }[];
  inclusions_suggestions: string[];
  exclusions_suggestions: string[];
  important_notes: string[];
}

const initialPreferences: TravelPreferences = {
  duration: 7,
  budgetRange: 'mid-range',
  interests: [],
  groupSize: 2,
  travelPace: 'moderate',
  languages: ['English'],
  schedule: {
    flexible: true,
  },
  travel: {
    portOfEntry: '',
    airportPickup: false,
    pickupTime: '',
    pickupLocation: '',
  },
  dietary: {
    mealWishes: '',
    allergies: '',
    specialRequirements: '',
  },
};

const steps = [
  { id: 1, title: 'Duration', description: 'How long is your ideal safari?' },
  { id: 2, title: 'Budget', description: 'What\'s your budget preference?' },
  { id: 3, title: 'Interests', description: 'What interests you most?' },
  { id: 4, title: 'Group Size', description: 'How many travelers?' },
  { id: 5, title: 'Travel Pace', description: 'What\'s your preferred pace?' },
  { id: 6, title: 'Languages', description: 'Which languages should your guide speak?' },
  { id: 7, title: 'Schedule', description: 'When would you like to travel?' },
  { id: 8, title: 'Travel Logistics', description: 'Airport and pickup details' },
  { id: 9, title: 'Dietary', description: 'Any dietary requirements?' },
];

// Mock AI Core Service simulation
const generateMockItinerary = (preferences: TravelPreferences): Promise<TourOutput> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockItinerary: TourOutput = {
        tour_name: `${preferences.duration}-Day Ultimate Kenya Safari Adventure`,
        summary: `Experience the best of Kenya's wildlife and landscapes with this carefully crafted ${preferences.duration}-day safari. Perfect for ${preferences.groupSize} travelers seeking a ${preferences.travelPace} pace adventure with ${preferences.budgetRange} accommodations. Guide speaks ${preferences.languages.join(', ')}.`,
        itinerary_details: Array.from({ length: preferences.duration }, (_, index) => ({
          day_number: index + 1,
          theme: index === 0 ? 'Arrival & Masai Mara' : 
                 index === 1 ? 'Masai Mara Full Day' :
                 index === 2 ? 'Lake Nakuru Adventure' :
                 index === preferences.duration - 1 ? 'Departure' :
                 `Wildlife & Culture Day ${index + 1}`,
          location: index === 0 ? 'Nairobi to Masai Mara' :
                   index === 1 ? 'Masai Mara National Reserve' :
                   index === 2 ? 'Lake Nakuru National Park' :
                   index === preferences.duration - 1 ? 'Nairobi' :
                   'Amboseli National Park',
          activities: preferences.interests.includes('Wildlife Safari') ? 
            ['Game Drive', 'Wildlife Photography', 'Bush Breakfast'] :
            ['Nature Walk', 'Cultural Visit', 'Scenic Drive'],
          accommodation_suggestion: preferences.budgetRange === 'luxury' ? 
            'Luxury Safari Lodge with Private Balcony' :
            preferences.budgetRange === 'mid-range' ?
            'Comfortable Safari Camp with Ensuite Facilities' :
            'Budget-Friendly Safari Lodge',
          meals: preferences.dietary.mealWishes ? 
            ['Breakfast (Dietary accommodated)', 'Lunch (Dietary accommodated)', 'Dinner (Dietary accommodated)'] :
            ['Breakfast', 'Lunch', 'Dinner'],
          travel_notes: index === 0 ? `Entry point: ${preferences.travel.portOfEntry || 'TBD'}` : undefined,
          pickup_details: index === 0 && preferences.travel.airportPickup ? {
            time: preferences.travel.pickupTime || 'TBD',
            location: preferences.travel.pickupLocation || 'TBD'
          } : undefined
        })),
        inclusions_suggestions: [
          'All park entrance fees',
          'Professional safari guide',
          'Game drives as per itinerary',
          'Accommodation as specified',
          'All meals during safari',
          'Transportation in 4WD safari vehicle',
          `Guide fluent in ${preferences.languages.join(', ')}`
        ],
        exclusions_suggestions: [
          'International flights',
          'Visa fees',
          'Personal expenses',
          'Alcoholic beverages',
          'Travel insurance',
          'Tips and gratuities'
        ],
        important_notes: [
          'Best time to travel is during dry seasons (June-October, December-March)',
          'Comfortable walking shoes and neutral-colored clothing recommended',
          'Binoculars and camera equipment advised for wildlife viewing',
          'Yellow fever vaccination may be required depending on your country of origin',
          preferences.dietary.allergies ? `Please inform guide of allergies: ${preferences.dietary.allergies}` : ''
        ].filter(Boolean)
      };
      resolve(mockItinerary);
    }, 2000);
  });
};

export const PreferenceWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<TravelPreferences>(initialPreferences);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<TourOutput | null>(null);

  const form = useForm({
    defaultValues: preferences
  });

  const updatePreferences = (updates: Partial<TravelPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
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
    
    try {
      const itinerary = await generateMockItinerary(preferences);
      setGeneratedItinerary(itinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToPreferences = () => {
    setGeneratedItinerary(null);
    setCurrentStep(1);
  };

  // Show loading state while generating
  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Creating Your Perfect Safari...</h3>
            <p className="text-gray-600">Our AI is crafting a personalized itinerary based on your preferences</p>
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DurationStep
            value={preferences.duration}
            onChange={(duration) => updatePreferences({ duration })}
          />
        );
      case 2:
        return (
          <BudgetStep
            value={preferences.budgetRange}
            onChange={(budgetRange) => updatePreferences({ budgetRange })}
          />
        );
      case 3:
        return (
          <InterestsStep
            value={preferences.interests}
            onChange={(interests) => updatePreferences({ interests })}
          />
        );
      case 4:
        return (
          <GroupSizeStep
            value={preferences.groupSize}
            onChange={(groupSize) => updatePreferences({ groupSize })}
          />
        );
      case 5:
        return (
          <TravelPaceStep
            value={preferences.travelPace}
            onChange={(travelPace) => updatePreferences({ travelPace })}
          />
        );
      case 6:
        return (
          <LanguagesStep
            value={preferences.languages}
            onChange={(languages) => updatePreferences({ languages })}
          />
        );
      case 7:
        return (
          <div className="space-y-6">
            <TravelScheduleForm 
              form={form} 
              onScheduleChange={(schedule) => updatePreferences({ schedule })}
            />
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Travel Logistics</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Port of Entry</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Jomo Kenyatta International Airport (NBO)"
                  value={preferences.travel.portOfEntry}
                  onChange={(e) => updatePreferences({
                    travel: { ...preferences.travel, portOfEntry: e.target.value }
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="airportPickup"
                  checked={preferences.travel.airportPickup}
                  onChange={(e) => updatePreferences({
                    travel: { ...preferences.travel, airportPickup: e.target.checked }
                  })}
                />
                <label htmlFor="airportPickup" className="text-sm font-medium">
                  Airport Pickup Required
                </label>
              </div>
              {preferences.travel.airportPickup && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pickup Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border rounded-md"
                      value={preferences.travel.pickupTime}
                      onChange={(e) => updatePreferences({
                        travel: { ...preferences.travel, pickupTime: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pickup Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., Terminal 1A, Gate 5"
                      value={preferences.travel.pickupLocation}
                      onChange={(e) => updatePreferences({
                        travel: { ...preferences.travel, pickupLocation: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Dietary Requirements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meal Wishes & Preferences</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="e.g., Vegetarian, Halal, local cuisine preferences..."
                  value={preferences.dietary.mealWishes}
                  onChange={(e) => updatePreferences({
                    dietary: { ...preferences.dietary, mealWishes: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Food Allergies & Restrictions</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="e.g., Nut allergies, gluten intolerance, lactose intolerance..."
                  value={preferences.dietary.allergies}
                  onChange={(e) => updatePreferences({
                    dietary: { ...preferences.dietary, allergies: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Special Dietary Requirements</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                  placeholder="Any other special dietary needs or medical requirements..."
                  value={preferences.dietary.specialRequirements}
                  onChange={(e) => updatePreferences({
                    dietary: { ...preferences.dietary, specialRequirements: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-1 mx-1 ${
                    step.id < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">
            Step {currentStep} of {steps.length}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderCurrentStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep === steps.length ? (
          <Button onClick={handleComplete} className="flex items-center">
            Generate My Safari
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={nextStep} className="flex items-center">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
