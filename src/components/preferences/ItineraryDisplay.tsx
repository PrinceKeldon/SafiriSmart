
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Users, DollarSign, Utensils, Plane, CheckCircle, Calendar } from 'lucide-react';
import { DayItineraryCard } from './itinerary/DayItineraryCard';
import { ItineraryHeader } from './itinerary/ItineraryHeader';
import { InclusionsExclusions } from './itinerary/InclusionsExclusions';
import { ImportantNotes } from './itinerary/ImportantNotes';
import { CallToAction } from './itinerary/CallToAction';
import { OperatorSelectionModal } from './OperatorSelectionModal';
import { useToast } from '@/hooks/use-toast';

interface ItineraryDisplayProps {
  itinerary: any;
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  userDetails: any;
  onBack: () => void;
  onComplete: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  preferences,
  schedule,
  travel,
  dietary,
  userDetails,
  onBack,
  onComplete
}) => {
  const { toast } = useToast();

  console.log('ItineraryDisplay: Rendering itinerary display');

  const handleContinueToUserDetails = () => {
    console.log('ItineraryDisplay: Moving to user details step');
    onComplete(); // This should trigger the transition to step 10 (User Details)
  };

  if (!itinerary) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No itinerary available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ItineraryHeader 
        itinerary={itinerary}
        preferences={preferences}
      />

      {/* Itinerary Days */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Itinerary</h2>
        {itinerary.itinerary_details?.map((day: any, index: number) => (
          <DayItineraryCard key={index} day={day} />
        ))}
      </div>

      <InclusionsExclusions 
        inclusions={itinerary.inclusions_suggestions || []}
        exclusions={itinerary.exclusions_suggestions || []}
      />
      
      <ImportantNotes 
        notes={itinerary.important_notes || []}
      />
      
      {/* Updated Call to Action */}
      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Book Your Safari Adventure?
          </h3>
          <p className="text-gray-600 mb-6">
            Continue to provide your contact details and we'll connect you with the best safari operators for your trip.
          </p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
            >
              Back to Preferences
            </Button>
            <Button
              onClick={handleContinueToUserDetails}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Continue to Contact Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItineraryDisplay;
