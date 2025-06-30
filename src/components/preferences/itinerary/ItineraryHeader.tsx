import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import { TourOutput } from '../WizardTypes';

interface ItineraryHeaderProps {
  itinerary: TourOutput;
  preferences: any; // Replace 'any' with the actual type if available
}

export const ItineraryHeader: React.FC<ItineraryHeaderProps> = ({ itinerary, preferences }) => {
  const totalDays = itinerary.itinerary_details.length;

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{itinerary.tour_name}</h2>
      <p className="text-gray-600 mb-4">{itinerary.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span>{totalDays} Days</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span>{preferences.groupSize} Travelers</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span>Kenya</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <span>{preferences.travelPace} Pace</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {preferences.interests.map((interest: string, index: number) => (
          <Badge key={index} variant="secondary">
            {interest}
          </Badge>
        ))}
      </div>
    </div>
  );
};
