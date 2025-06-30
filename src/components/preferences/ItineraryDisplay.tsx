
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TravelPreferences, TourOutput } from './WizardTypes';
import { ItineraryHeader } from './itinerary/ItineraryHeader';
import { DayItineraryCard } from './itinerary/DayItineraryCard';
import { InclusionsExclusions } from './itinerary/InclusionsExclusions';
import { ImportantNotes } from './itinerary/ImportantNotes';
import { CallToAction } from './itinerary/CallToAction';
import { LeadCaptureForm } from './LeadCaptureForm';

interface ItineraryDisplayProps {
  itinerary: TourOutput;
  preferences: TravelPreferences;
  onBackToPreferences: () => void;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, preferences, onBackToPreferences }) => {
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  const handleConnectExpert = () => {
    console.log('Connect with expert clicked');
    setShowLeadCapture(true);
  };

  const handleRequestQuote = () => {
    console.log('Request quote clicked');
    setShowLeadCapture(true);
  };

  const handleBackToItinerary = () => {
    setShowLeadCapture(false);
  };

  // Show lead capture form if requested
  if (showLeadCapture) {
    return (
      <LeadCaptureForm
        itinerary={itinerary}
        preferences={preferences}
        onBackToPreferences={onBackToPreferences}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Button variant="outline" onClick={onBackToPreferences} className="w-full md:w-auto">
        ← Back to Preferences
      </Button>

      <ItineraryHeader itinerary={itinerary} preferences={preferences} />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{itinerary.tour_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{itinerary.summary}</p>
        </CardContent>
      </Card>

      {itinerary.itinerary_details.map((day) => (
        <DayItineraryCard key={day.day_number} day={day} />
      ))}

      <InclusionsExclusions 
        inclusions={itinerary.inclusions_suggestions}
        exclusions={itinerary.exclusions_suggestions}
      />

      <ImportantNotes notes={itinerary.important_notes} />

      <CallToAction 
        onConnectExpert={handleConnectExpert}
        onRequestQuote={handleRequestQuote}
      />
    </div>
  );
};
