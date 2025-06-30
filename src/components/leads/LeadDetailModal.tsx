import { useState } from 'react';
import { X, MapPin, CalendarDays, Users, DollarSign, Clock, Bed, Car } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/types/api';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onAddNote: (leadId: string, note: string) => void;
}

export const LeadDetailModal = ({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote
}: LeadDetailModalProps) => {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!lead) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAddingNote(true);
    try {
      await onAddNote(lead.id, newNote);
      setNewNote('');
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Lead Details - {lead.traveler.name}</span>
            <Badge className={`ml-2 ${
              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
              lead.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
              lead.status === 'booked' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="notes">Notes & Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Traveler Information */}
            <Card>
              <CardHeader>
                <CardTitle>Traveler Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{lead.traveler.name}</p>
                  <p className="text-sm text-gray-600">{lead.traveler.email}</p>
                  <p className="text-sm text-gray-600">{lead.traveler.phone}</p>
                  <p className="text-sm text-gray-600">{lead.traveler.country}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{lead.preferences.groupSize} travelers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span className="text-sm capitalize">{lead.preferences.accommodationType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{lead.preferences.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>{lead.preferences.duration} days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatCurrency(lead.preferences.budget.min, lead.preferences.budget.currency)} - {formatCurrency(lead.preferences.budget.max, lead.preferences.budget.currency)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Travel Dates:</p>
                  <p className="text-sm">
                    {formatDate(lead.preferences.travelDates.startDate)} - {formatDate(lead.preferences.travelDates.endDate)}
                    {lead.preferences.travelDates.flexible && <span className="text-blue-600 ml-2">(Flexible dates)</span>}
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-2">Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.preferences.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-4">
            {/* Itinerary Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{lead.itinerary.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{lead.itinerary.overview}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{lead.itinerary.totalDuration} days total</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>
                      Est. {formatCurrency(lead.itinerary.estimatedCost.amount, lead.itinerary.estimatedCost.currency)}
                    </span>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Cost Breakdown:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Accommodation: {formatCurrency(lead.itinerary.estimatedCost.breakdown.accommodation, lead.itinerary.estimatedCost.currency)}</div>
                    <div>Transport: {formatCurrency(lead.itinerary.estimatedCost.breakdown.transport, lead.itinerary.estimatedCost.currency)}</div>
                    <div>Activities: {formatCurrency(lead.itinerary.estimatedCost.breakdown.activities, lead.itinerary.estimatedCost.currency)}</div>
                    <div>Meals: {formatCurrency(lead.itinerary.estimatedCost.breakdown.meals, lead.itinerary.estimatedCost.currency)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Itinerary */}
            <div className="space-y-4">
              {lead.itinerary.days.map((day) => (
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
                                {formatCurrency(activity.cost, lead.itinerary.estimatedCost.currency)}
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
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  {lead.status === 'new' && (
                    <Button onClick={() => onUpdateStatus(lead.id, 'contacted')}>
                      Mark as Contacted
                    </Button>
                  )}
                  {lead.status === 'contacted' && (
                    <Button onClick={() => onUpdateStatus(lead.id, 'quoted')}>
                      Send Quote
                    </Button>
                  )}
                  {lead.status === 'quoted' && (
                    <Button onClick={() => onUpdateStatus(lead.id, 'booked')}>
                      Mark as Booked
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Note */}
            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add a note about this lead..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()}>
                  Add Note
                </Button>
              </CardContent>
            </Card>

            {/* Existing Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes History</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.notes.length === 0 ? (
                  <p className="text-gray-500">No notes yet.</p>
                ) : (
                  <div className="space-y-2">
                    {lead.notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
