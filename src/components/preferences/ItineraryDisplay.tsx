
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Users, DollarSign, Utensils, Plane, CheckCircle, Calendar } from 'lucide-react';
import { DayItineraryCard } from './itinerary/DayItineraryCard';
import { ItineraryHeader } from './itinerary/ItineraryHeader';
import { InclusionsExclusions } from './itinerary/InclusionsExclusions';
import { ImportantNotes } from './itinerary/ImportantNotes';
import LeadCaptureForm from './LeadCaptureForm';

interface ItineraryDisplayProps {
  itinerary: any;
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  onBack: () => void;
  onComplete: (result: any) => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  preferences,
  schedule,
  travel,
  dietary,
  onBack,
  onComplete
}) => {
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  console.log('ItineraryDisplay: Rendering itinerary display');

  const handleProceedToBooking = () => {
    console.log('ItineraryDisplay: Proceeding to lead capture');
    setShowLeadCapture(true);
  };

  const handleLeadCaptureBack = () => {
    setShowLeadCapture(false);
  };

  const handleLeadCaptureComplete = (result: any) => {
    console.log('ItineraryDisplay: Lead capture completed:', result);
    onComplete(result);
  };

  if (showLeadCapture) {
    return (
      <LeadCaptureForm
        preferences={preferences}
        schedule={schedule}
        travel={travel}
        dietary={dietary}
        itinerary={itinerary}
        onComplete={handleLeadCaptureComplete}
        onBack={handleLeadCaptureBack}
      />
    );
  }

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
      
      {/* Call to Action for Lead Capture */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Make This Safari a Reality?
            </h3>
            <p className="text-gray-600 mb-6">
              Connect with our local experts to customize your itinerary and get personalized quotes from safari operators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center" onClick={handleProceedToBooking}>
                <Users className="w-5 h-5 mr-2" />
                Get Personalized Quotes
              </Button>
              <Button size="lg" variant="outline" className="flex items-center" onClick={onBack}>
                <Calendar className="w-5 h-5 mr-2" />
                Back to Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItineraryDisplay;
