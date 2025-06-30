
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Camera, 
  Bed, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { TravelPreferences, TourOutput } from './PreferenceWizard';
import { PriceEstimation } from './PriceEstimation';
import { LeadCaptureForm } from './LeadCaptureForm';
import { LeadConfirmation } from './LeadConfirmation';

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
      {/* Header */}
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

      {/* Price Estimation */}
      <PriceEstimation preferences={preferences} />

      {/* Itinerary Details */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Day-by-Day Itinerary
        </h2>
        
        {itinerary.itinerary_details.map((day, index) => (
          <Card key={day.day_number} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Day {day.day_number}: {day.theme}
                </CardTitle>
                <Badge variant="secondary">
                  <MapPin className="w-3 h-3 mr-1" />
                  {day.location}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Activities */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Activities
                  </h4>
                  <ul className="space-y-2">
                    {day.activities.map((activity, actIndex) => (
                      <li key={actIndex} className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Accommodation */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Bed className="w-4 h-4 mr-2" />
                    Accommodation
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {day.accommodation_suggestion}
                  </p>
                </div>
              </div>
              
              {/* Placeholder for location image */}
              <div className="mt-6">
                <div className="w-full h-48 bg-gradient-to-r from-green-200 to-blue-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>{day.location}</p>
                    <p className="text-sm">Photo placeholder</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inclusions & Exclusions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              What's Included
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {itinerary.inclusions_suggestions.map((inclusion, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  {inclusion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-red-700">
              <XCircle className="w-5 h-5 mr-2" />
              What's Not Included
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {itinerary.exclusions_suggestions.map((exclusion, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                  {exclusion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-orange-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {itinerary.important_notes.map((note, index) => (
              <li key={index} className="flex items-start text-gray-700">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Make This Safari a Reality?
            </h3>
            <p className="text-gray-600 mb-6">
              Connect with our local experts to customize your itinerary and get detailed pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center" onClick={handleConnectExpert}>
                <Users className="w-5 h-5 mr-2" />
                Connect with Local Expert
              </Button>
              <Button size="lg" variant="outline" className="flex items-center" onClick={handleRequestQuote}>
                <Calendar className="w-5 h-5 mr-2" />
                Request Detailed Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
