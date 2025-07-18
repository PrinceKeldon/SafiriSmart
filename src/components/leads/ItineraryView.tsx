
import { Clock, DollarSign, Bed, Car, Edit, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/lead';
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

interface ItineraryViewProps {
  lead: Lead;
  onLeadUpdate?: (updatedLead: Lead) => void;
  readOnly?: boolean;
}

export const ItineraryView = ({ lead, readOnly = false }: ItineraryViewProps) => {
  const itinerary = lead.itinerary;
  console.log('🎯 ItineraryView: Received itinerary data:', itinerary);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!itinerary) {
    console.log('❌ ItineraryView: No itinerary data provided');
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No itinerary available for this lead.</p>
        </CardContent>
      </Card>
    );
  }

  // Handle different itinerary data structures
  let processedItinerary;
  
  // Check if it's already in the expected format
  if (itinerary.title || itinerary.tour_name) {
    processedItinerary = {
      title: itinerary.title || itinerary.tour_name || 'Safari Itinerary',
      overview: itinerary.overview || itinerary.summary || 'Custom safari experience',
      totalDuration: itinerary.totalDuration || itinerary.itinerary_details?.length || itinerary.days?.length || 0,
      estimatedCost: itinerary.estimatedCost || {
        amount: itinerary.total_cost || itinerary.estimated_cost || 0,
        currency: itinerary.currency || 'USD',
        breakdown: itinerary.cost_breakdown || {
          accommodation: 0,
          transport: 0,
          activities: 0,
          meals: 0,
          other: 0
        }
      },
      days: itinerary.days || itinerary.itinerary_details || []
    };
  } else {
    // If it's raw data, create a basic structure
    processedItinerary = {
      title: 'Safari Itinerary',
      overview: 'Custom safari experience based on your preferences',
      totalDuration: Array.isArray(itinerary) ? itinerary.length : 0,
      estimatedCost: {
        amount: 0,
        currency: 'USD',
        breakdown: {
          accommodation: 0,
          transport: 0,
          activities: 0,
          meals: 0,
          other: 0
        }
      },
      days: Array.isArray(itinerary) ? itinerary : []
    };
  }

  console.log('🔄 ItineraryView: Processed itinerary:', processedItinerary);

  return (
    <div className="space-y-4">
      {/* Itinerary Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{processedItinerary.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{processedItinerary.overview}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{processedItinerary.totalDuration} days total</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>
                Est. {formatCurrency(processedItinerary.estimatedCost.amount, processedItinerary.estimatedCost.currency)}
              </span>
            </div>
          </div>

          {/* Cost Breakdown */}
          {processedItinerary.estimatedCost.breakdown && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Cost Breakdown:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Accommodation: {formatCurrency(processedItinerary.estimatedCost.breakdown.accommodation || 0, processedItinerary.estimatedCost.currency)}</div>
                <div>Transport: {formatCurrency(processedItinerary.estimatedCost.breakdown.transport || 0, processedItinerary.estimatedCost.currency)}</div>
                <div>Activities: {formatCurrency(processedItinerary.estimatedCost.breakdown.activities || 0, processedItinerary.estimatedCost.currency)}</div>
                <div>Meals: {formatCurrency(processedItinerary.estimatedCost.breakdown.meals || 0, processedItinerary.estimatedCost.currency)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Itinerary */}
      <div className="space-y-4">
        {processedItinerary.days && processedItinerary.days.length > 0 ? (
          processedItinerary.days.map((day: any, index: number) => (
            <Card key={day.day || index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Day {day.day || index + 1} - {day.location || day.destination || 'Safari Location'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Bed className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Accommodation</span>
                    </div>
                    <p className="text-sm">{day.accommodation?.name || day.accommodation || 'Safari Lodge'}</p>
                    <p className="text-xs text-gray-600">
                      {day.accommodation?.type || 'Lodge'} - {day.accommodation?.rating || 4}★
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Transport</span>
                    </div>
                    <p className="text-sm">{day.transport || 'Safari Vehicle'}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Activities:</p>
                  <div className="space-y-2">
                    {day.activities && day.activities.length > 0 ? (
                      day.activities.map((activity: any, actIndex: number) => (
                        <div key={actIndex} className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{activity.name || activity.activity || `Activity ${actIndex + 1}`}</p>
                              <p className="text-sm text-gray-600">{activity.description || 'Safari activity'}</p>
                              <p className="text-xs text-gray-500">Duration: {activity.duration || '2-4 hours'}</p>
                            </div>
                            {activity.cost && (
                              <Badge variant="outline" className="text-xs">
                                {formatCurrency(activity.cost, processedItinerary.estimatedCost.currency)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium">Game Drive</p>
                        <p className="text-sm text-gray-600">Wildlife viewing and photography</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-medium">Meals: {day.meals?.join(', ') || 'Breakfast, Lunch, Dinner'}</p>
                </div>

                {day.notes && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm"><strong>Note:</strong> {day.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No daily itinerary details available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
