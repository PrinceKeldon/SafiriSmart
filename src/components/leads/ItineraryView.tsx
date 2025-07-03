
import { Clock, DollarSign, Bed, Car, Edit, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TripItinerary } from '@/types/api';

interface ItineraryViewProps {
  itinerary: TripItinerary;
}

export const ItineraryView = ({ itinerary }: ItineraryViewProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!itinerary) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No itinerary available for this lead.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Itinerary Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{itinerary.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{itinerary.overview}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{itinerary.totalDuration} days total</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>
                Est. {formatCurrency(itinerary.estimatedCost.amount, itinerary.estimatedCost.currency)}
              </span>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">Cost Breakdown:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Accommodation: {formatCurrency(itinerary.estimatedCost.breakdown.accommodation, itinerary.estimatedCost.currency)}</div>
              <div>Transport: {formatCurrency(itinerary.estimatedCost.breakdown.transport, itinerary.estimatedCost.currency)}</div>
              <div>Activities: {formatCurrency(itinerary.estimatedCost.breakdown.activities, itinerary.estimatedCost.currency)}</div>
              <div>Meals: {formatCurrency(itinerary.estimatedCost.breakdown.meals, itinerary.estimatedCost.currency)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Itinerary */}
      <div className="space-y-4">
        {itinerary.days.map((day) => (
          <Card key={day.day}>
            <CardHeader>
              <CardTitle className="text-lg">Day {day.day} - {day.location}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Accommodation</span>
                  </div>
                  <p className="text-sm">{day.accommodation.name}</p>
                  <p className="text-xs text-gray-600">{day.accommodation.type} - {day.accommodation.rating}★</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Transport</span>
                  </div>
                  <p className="text-sm">{day.transport}</p>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Activities:</p>
                <div className="space-y-2">
                  {day.activities.map((activity, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">Duration: {activity.duration}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(activity.cost, itinerary.estimatedCost.currency)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium">Meals: {day.meals.join(', ')}</p>
              </div>

              {day.notes && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm"><strong>Note:</strong> {day.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
