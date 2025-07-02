
import React from 'react';
import { TravelPreferences } from '../WizardTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

interface TravelScheduleStepProps {
  value: TravelPreferences['schedule'];
  onChange: (schedule: TravelPreferences['schedule']) => void;
}

export const TravelScheduleStep: React.FC<TravelScheduleStepProps> = ({ value, onChange }) => {
  const handleFlexibleChange = (checked: boolean) => {
    onChange({
      ...value,
      flexible: checked,
      // Clear dates if switching to flexible
      ...(checked && { startDate: undefined, endDate: undefined })
    });
  };

  const handleStartDateChange = (dateString: string) => {
    onChange({
      ...value,
      startDate: dateString ? new Date(dateString) : undefined
    });
  };

  const handleEndDateChange = (dateString: string) => {
    onChange({
      ...value,
      endDate: dateString ? new Date(dateString) : undefined
    });
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Travel Schedule</h3>
        <p className="text-gray-600">When would you like to travel?</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Checkbox
              id="flexible"
              checked={value.flexible}
              onCheckedChange={handleFlexibleChange}
            />
            <div>
              <Label htmlFor="flexible" className="font-medium">
                Flexible Travel Dates
              </Label>
              <p className="text-sm text-gray-600">
                Check if you're flexible with your travel dates
              </p>
            </div>
          </div>

          {!value.flexible && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="block mb-2">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formatDateForInput(value.startDate)}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="block mb-2">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formatDateForInput(value.endDate)}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={formatDateForInput(value.startDate)}
                />
              </div>
            </div>
          )}

          {value.flexible && (
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Flexible Dates Selected</p>
              <p className="text-green-600 text-sm">
                We'll help you find the best time to travel based on weather, wildlife migrations, and availability.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
