
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
import LeadCaptureForm from './LeadCaptureForm';

interface ItineraryDisplayProps {
  itinerary: any;
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  selectedPackages: string[];
  onBack: () => void;
  onComplete: (result: any) => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  preferences,
  schedule,
  travel,
  dietary,
  selectedPackages,
  onBack,
  onComplete
}) => {
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  console.log('ItineraryDisplay: Rendering with selectedPackages:', selectedPackages);

  const handleProceedToBooking = () => {
    console.log('ItineraryDisplay: Proceeding to lead capture with packages:', selectedPackages);
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
        selectedPackages={selectedPackages}
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

      {/* Selected Packages Summary */}
      {selectedPackages.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Selected Safari Packages ({selectedPackages.length})
              </h3>
            </div>
            <p className="text-blue-700 text-sm">
              You've selected {selectedPackages.length} package{selectedPackages.length !== 1 ? 's' : ''} from our operators. 
              Your inquiry will be sent directly to these operators for personalized quotes and availability.
            </p>
          </CardContent>
        </Card>
      )}

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
      
      {/* Custom Call to Action for Lead Capture */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Make This Safari a Reality?
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedPackages.length > 0 
                ? `Connect with your selected ${selectedPackages.length} operator${selectedPackages.length !== 1 ? 's' : ''} to get personalized quotes.`
                : 'Connect with our local experts to customize your itinerary and get detailed pricing.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center" onClick={handleProceedToBooking}>
                <Users className="w-5 h-5 mr-2" />
                {selectedPackages.length > 0 ? 'Submit Inquiry to Selected Operators' : 'Connect with Local Expert'}
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
