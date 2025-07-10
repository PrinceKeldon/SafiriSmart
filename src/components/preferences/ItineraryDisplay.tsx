
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
  onComplete: (result: any) => void;
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
  const [showOperatorSelection, setShowOperatorSelection] = useState(false);
  const { toast } = useToast();

  console.log('ItineraryDisplay: Rendering itinerary display');

  const handleSelectOperators = () => {
    console.log('ItineraryDisplay: Opening operator selection modal');
    setShowOperatorSelection(true);
  };

  const handleOperatorsSelected = (selectedOperatorIds: string[]) => {
    console.log('ItineraryDisplay: Operators selected:', selectedOperatorIds);
    setShowOperatorSelection(false);
    
    // Complete the wizard flow
    onComplete({
      success: true,
      message: `Inquiry sent to ${selectedOperatorIds.length} operator${selectedOperatorIds.length > 1 ? 's' : ''}`,
      selectedOperators: selectedOperatorIds.length
    });
  };

  const handleCloseModal = () => {
    setShowOperatorSelection(false);
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
      <CallToAction onSelectOperators={handleSelectOperators} />

      {/* Operator Selection Modal */}
      <OperatorSelectionModal
        isOpen={showOperatorSelection}
        onClose={handleCloseModal}
        onOperatorsSelected={handleOperatorsSelected}
        travelerData={{
          traveler: userDetails,
          preferences,
          schedule,
          travel,
          dietary,
          itinerary
        }}
      />
    </div>
  );
};

export default ItineraryDisplay;
