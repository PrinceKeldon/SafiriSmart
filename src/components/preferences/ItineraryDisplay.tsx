
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import { TravelPreferences, TourOutput } from './PreferenceWizard';
import { PriceEstimation } from './PriceEstimation';
import { LeadCaptureForm } from './LeadCaptureForm';
import { LeadConfirmation } from './LeadConfirmation';
import { ItineraryHeader } from './itinerary/ItineraryHeader';
import { DayItineraryCard } from './itinerary/DayItineraryCard';
import { InclusionsExclusions } from './itinerary/InclusionsExclusions';
import { ImportantNotes } from './itinerary/ImportantNotes';
import { CallToAction } from './itinerary/CallToAction';

interface ItineraryDisplayProps {
  itinerary: TourOutput;
  preferences: TravelPreferences;
  onBackToPreferences: () => void;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ 
  itinerary, 
  preferences,
  onBackToPreferences 
}) => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [leadFormType, setLeadFormType] = useState<'expert' | 'quote'>('expert');

  const handleConnectExpert = () => {
    setLeadFormType('expert');
    setShowLeadForm(true);
  };

  const handleRequestQuote = () => {
    setLeadFormType('quote');
    setShowLeadForm(true);
  };

  const handleLeadSuccess = () => {
    setShowLeadForm(false);
    setShowConfirmation(true);
  };

  const handleStartOver = () => {
    setShowConfirmation(false);
    onBackToPreferences();
  };

  if (showConfirmation) {
    return <LeadConfirmation onStartOver={handleStartOver} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ItineraryHeader 
        itinerary={itinerary}
        onBackToPreferences={onBackToPreferences}
      />

      <PriceEstimation preferences={preferences} />

      {/* Itinerary Details */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Day-by-Day Itinerary
        </h2>
        
        {itinerary.itinerary_details.map((day) => (
          <DayItineraryCard key={day.day_number} day={day} />
        ))}
      </div>

      <InclusionsExclusions 
        inclusions={itinerary.inclusions_suggestions}
        exclusions={itinerary.exclusions_suggestions}
      />

      <ImportantNotes notes={itinerary.important_notes} />

      <CallToAction 
        onConnectExpert={handleConnectExpert}
        onRequestQuote={handleRequestQuote}
      />

      {/* Lead Capture Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {leadFormType === 'expert' ? 'Connect with Local Expert' : 'Request Detailed Quote'}
            </DialogTitle>
          </DialogHeader>
          <LeadCaptureForm
            preferences={preferences}
            itinerary={itinerary}
            onSuccess={handleLeadSuccess}
            onCancel={() => setShowLeadForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
