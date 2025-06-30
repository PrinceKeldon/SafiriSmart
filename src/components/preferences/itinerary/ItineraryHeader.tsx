
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TourOutput } from '../PreferenceWizard';

interface ItineraryHeaderProps {
  itinerary: TourOutput;
  onBackToPreferences: () => void;
}

export const ItineraryHeader: React.FC<ItineraryHeaderProps> = ({
  itinerary,
  onBackToPreferences
}) => {
  return (
    <div className="mb-8">
      <Button 
        variant="outline" 
        onClick={onBackToPreferences}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Preferences
      </Button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {itinerary.tour_name}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {itinerary.summary}
        </p>
      </div>
    </div>
  );
};
