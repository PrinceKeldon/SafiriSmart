
import React, { useState } from 'react';
import { TravelPreferences, TourOutput, ItineraryDay } from '@/components/preferences/WizardTypes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, AlertTriangle, Download, Printer } from 'lucide-react';
import { DayItineraryCard } from '@/components/preferences/itinerary/DayItineraryCard';
import { InclusionsExclusions } from '@/components/preferences/itinerary/InclusionsExclusions';
import { ImportantNotes } from '@/components/preferences/itinerary/ImportantNotes';
import { CallToAction } from '@/components/preferences/itinerary/CallToAction';
import { ItineraryHeader } from '@/components/preferences/itinerary/ItineraryHeader';
import { downloadItineraryPDF, downloadItineraryHTML } from './utils/itineraryDownload';

interface ItineraryDisplayProps {
  itinerary: TourOutput;
  preferences?: TravelPreferences;
  schedule?: any;
  travel?: any;
  dietary?: any;
  userDetails?: any;
  onBack: () => void;
  onComplete: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ 
  itinerary, 
  preferences = {
    interests: [],
    duration: 7,
    groupSize: 2,
    budgetRange: 'mid-range',
    travelPace: 'moderate',
    languages: ['English']
  },
  userDetails,
  onBack, 
  onComplete 
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  if (!itinerary) {
    return <div>No itinerary to display.</div>;
  }

  if (!itinerary.itinerary_details) {
    return <div>Itinerary details are not available.</div>;
  }

  const isSmartGenerated = itinerary.creativity_metadata?.generation_method === 'smart_ai_with_package_matching';
  const packageMatches = itinerary.creativity_metadata?.creativity_elements?.includes('Package-matched destinations');

  const handlePrintItinerary = () => {
    downloadItineraryPDF(itinerary, userDetails);
  };

  const handleDownloadItinerary = () => {
    downloadItineraryHTML(itinerary, userDetails);
  };

  return (
    <div className="space-y-6">
      {/* Smart Generation Notice */}
      {isSmartGenerated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">AI</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-blue-800 font-semibold mb-1">Smart Itinerary Suggestions</h4>
              <p className="text-blue-700 text-sm">
                This itinerary has been intelligently generated based on your preferences and 
                {packageMatches ? ' matched with verified operator packages in our system' : ' available destination data'}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Important Planning Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-amber-800 font-semibold mb-2">Planning Guide Notice</h4>
            <div className="text-amber-700 text-sm space-y-1">
              <p>• <strong>This is a planning guide</strong>, not a final booking or confirmed itinerary</p>
              <p>• Please <strong>discuss and adjust</strong> all details with your chosen tour operator</p>
              <p>• Activities, accommodations, and pricing are <strong>subject to availability</strong> and operator confirmation</p>
              <p>• Use this as a <strong>conversation starter</strong> when contacting operators for quotes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Header */}
      <ItineraryHeader itinerary={itinerary} preferences={preferences} />

      {/* Download/Print Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={handlePrintItinerary}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Itinerary
        </Button>
        <Button 
          onClick={handleDownloadItinerary}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Itinerary
        </Button>
      </div>

      {/* Package Matching Info */}
      {isSmartGenerated && itinerary.creativity_metadata?.diversity_score && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-green-800 font-semibold">Package Matching Score</h4>
              <p className="text-green-700 text-sm">
                Matched with operator packages based on your preferences
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((itinerary.creativity_metadata.diversity_score / 100) * 100)}%
              </div>
              <div className="text-xs text-green-600">Match Quality</div>
            </div>
          </div>
        </div>
      )}

      {/* Show/Hide Details Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          {showFullDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Show Less Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Show Full Itinerary Details</span>
            </>
          )}
        </button>
      </div>

      {/* Itinerary Details */}
      {showFullDetails && (
        <div className="space-y-4">
          {itinerary.itinerary_details.map((day, index) => (
            <DayItineraryCard key={index} day={day} dayIndex={index} />
          ))}
        </div>
      )}

      {/* Inclusions & Exclusions */}
      <InclusionsExclusions 
        inclusions={itinerary.inclusions_suggestions}
        exclusions={itinerary.exclusions_suggestions}
      />

      {/* Important Notes with Enhanced Messaging */}
      <ImportantNotes 
        notes={itinerary.important_notes}
        isSmartGenerated={isSmartGenerated}
      />

      {/* Call to Action */}
      <CallToAction 
        onBack={onBack}
        onContinue={onComplete}
        isSmartGenerated={isSmartGenerated}
      />
    </div>
  );
};

export default ItineraryDisplay;
