
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock } from 'lucide-react';

interface TravelScheduleFormProps {
  form: UseFormReturn<any>;
}

export const TravelScheduleForm: React.FC<TravelScheduleFormProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Travel Schedule</h3>
        <p className="text-gray-600">When would you like to travel?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <Label htmlFor="start-date" className="text-sm font-medium mb-2 block">
            Preferred Start Date
          </Label>
          <Input
            id="start-date"
            type="date"
            {...form.register('schedule.startDate')}
            className="w-full"
          />
        </Card>

        <Card className="p-4">
          <Label htmlFor="end-date" className="text-sm font-medium mb-2 block">
            Preferred End Date
          </Label>
          <Input
            id="end-date"
            type="date"
            {...form.register('schedule.endDate')}
            className="w-full"
          />
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="flexible-dates"
            {...form.register('schedule.flexible')}
          />
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <Label htmlFor="flexible-dates" className="text-sm font-medium cursor-pointer">
              My dates are flexible
            </Label>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-6">
          Flexible dates may help us find better deals and availability
        </p>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Best Time to Visit Kenya</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Dry Season (June-October):</strong> Best for wildlife viewing, clear skies</p>
          <p><strong>Wet Season (November-May):</strong> Fewer crowds, lush landscapes, lower prices</p>
          <p><strong>Great Migration:</strong> July-September in Maasai Mara</p>
        </div>
      </div>
    </div>
  );
};
