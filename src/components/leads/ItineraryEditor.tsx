
import { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TripItinerary, ItineraryDay, Activity } from '@/types/api';

interface ItineraryEditorProps {
  itinerary: TripItinerary | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItinerary: TripItinerary) => void;
  isLoading?: boolean;
}

export const ItineraryEditor = ({
  itinerary,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: ItineraryEditorProps) => {
  const [editedItinerary, setEditedItinerary] = useState<TripItinerary | null>(null);

  // Initialize edited itinerary when modal opens
  const handleOpen = () => {
    if (itinerary) {
      setEditedItinerary(JSON.parse(JSON.stringify(itinerary))); // Deep clone
    }
  };

  const handleSave = () => {
    if (editedItinerary) {
      onSave(editedItinerary);
    }
  };

  const updateDay = (dayIndex: number, field: string, value: any) => {
    if (!editedItinerary) return;
    
    const updatedDays = [...editedItinerary.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    
    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays
    });
  };

  const addActivity = (dayIndex: number) => {
    if (!editedItinerary) return;
    
    const newActivity: Activity = {
      name: 'New Activity',
      duration: '2 hours',
      description: 'Activity description',
      cost: 0,
      type: 'safari'
    };
    
    const updatedDays = [...editedItinerary.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: [...updatedDays[dayIndex].activities, newActivity]
    };
    
    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays
    });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    if (!editedItinerary) return;
    
    const updatedDays = [...editedItinerary.days];
    const updatedActivities = [...updatedDays[dayIndex].activities];
    updatedActivities.splice(activityIndex, 1);
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: updatedActivities
    };
    
    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays
    });
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: string, value: any) => {
    if (!editedItinerary) return;
    
    const updatedDays = [...editedItinerary.days];
    const updatedActivities = [...updatedDays[dayIndex].activities];
    updatedActivities[activityIndex] = {
      ...updatedActivities[activityIndex],
      [field]: value
    };
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: updatedActivities
    };
    
    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays
    });
  };

  if (!itinerary || !editedItinerary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { 
      if (open) handleOpen();
      else onClose();
    }}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Itinerary</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Itinerary Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={editedItinerary.title}
                  onChange={(e) => setEditedItinerary({
                    ...editedItinerary,
                    title: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Overview</label>
                <Textarea
                  value={editedItinerary.overview}
                  onChange={(e) => setEditedItinerary({
                    ...editedItinerary,
                    overview: e.target.value
                  })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Daily Itinerary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Daily Itinerary</h3>
            {editedItinerary.days.map((day, dayIndex) => (
              <Card key={day.day}>
                <CardHeader>
                  <CardTitle className="text-base">Day {day.day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <Input
                        value={day.location}
                        onChange={(e) => updateDay(dayIndex, 'location', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Accommodation</label>
                      <Input
                        value={day.accommodation.name}
                        onChange={(e) => updateDay(dayIndex, 'accommodation', {
                          ...day.accommodation,
                          name: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Activities</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addActivity(dayIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Activity
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {day.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 gap-2 flex-1">
                              <Input
                                placeholder="Activity name"
                                value={activity.name}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'name', e.target.value)}
                              />
                              <Input
                                placeholder="Duration"
                                value={activity.duration}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'duration', e.target.value)}
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeActivity(dayIndex, activityIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Activity description"
                            value={activity.description}
                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <Textarea
                      value={day.notes || ''}
                      onChange={(e) => updateDay(dayIndex, 'notes', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
