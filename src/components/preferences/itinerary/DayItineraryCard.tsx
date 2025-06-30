
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera, Bed, CheckCircle } from 'lucide-react';

interface DayItineraryCardProps {
  day: {
    day_number: number;
    location: string;
    theme: string;
    activities: string[];
    accommodation_suggestion: string;
  };
}

export const DayItineraryCard: React.FC<DayItineraryCardProps> = ({ day }) => {
  return (
    <Card className="overflow-hidden">
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
  );
};
