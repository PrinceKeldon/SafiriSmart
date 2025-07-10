
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface DurationStepProps {
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DurationStep: React.FC<DurationStepProps> = ({ value, onChange, onNext, onBack }) => {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const getDurationText = (days: number) => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }
    return `${weeks} week${weeks > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-primary mb-2">
          {getDurationText(value)}
        </div>
        <p className="text-gray-600">
          Most safaris range from 3-14 days
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="duration-slider">Duration: {value} days</Label>
        <Slider
          id="duration-slider"
          min={1}
          max={21}
          step={1}
          value={[value]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>1 day</span>
          <span>3 weeks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`p-4 cursor-pointer transition-colors ${
            value >= 1 && value <= 3 ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
          }`}
          onClick={() => onChange(3)}
        >
          <h3 className="font-semibold">Quick Escape</h3>
          <p className="text-sm text-gray-600">1-3 days</p>
          <p className="text-xs text-gray-500 mt-1">Perfect for a weekend getaway</p>
        </Card>
        <Card 
          className={`p-4 cursor-pointer transition-colors ${
            value >= 4 && value <= 10 ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
          }`}
          onClick={() => onChange(7)}
        >
          <h3 className="font-semibold">Classic Safari</h3>
          <p className="text-sm text-gray-600">4-10 days</p>
          <p className="text-xs text-gray-500 mt-1">Most popular choice</p>
        </Card>
        <Card 
          className={`p-4 cursor-pointer transition-colors ${
            value >= 11 ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
          }`}
          onClick={() => onChange(14)}
        >
          <h3 className="font-semibold">Extended Adventure</h3>
          <p className="text-sm text-gray-600">11+ days</p>
          <p className="text-xs text-gray-500 mt-1">Deep exploration experience</p>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button
          onClick={onNext}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
