
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Minus, Plus, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleGroupSizeStepProps {
  value: number;
  onChange: (value: number) => void;
}

export const SimpleGroupSizeStep: React.FC<SimpleGroupSizeStepProps> = ({ value, onChange }) => {
  const increment = () => {
    if (value < 20) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 1;
    if (newValue >= 1 && newValue <= 20) {
      onChange(newValue);
    }
  };

  const commonGroupSizes = [
    { size: 2, label: 'Couple', icon: User },
    { size: 4, label: 'Small Group', icon: Users },
    { size: 6, label: 'Family Group', icon: Users },
    { size: 8, label: 'Large Group', icon: Users },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-2">
          {value} {value === 1 ? 'Traveler' : 'Travelers'}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= 1}
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="group-size" className="text-sm font-medium">
            Group Size:
          </Label>
          <Input
            id="group-size"
            type="number"
            min="1"
            max="20"
            value={value}
            onChange={handleInputChange}
            className="w-20 text-center"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= 20}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {commonGroupSizes.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.size;
          
          return (
            <Card
              key={option.size}
              className={`p-3 cursor-pointer transition-all text-center ${
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5 shadow-sm'
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
              onClick={() => onChange(option.size)}
            >
              <div className={`mx-auto w-6 h-6 rounded-lg flex items-center justify-center mb-1 ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
              }`}>
                <Icon className="w-3 h-3" />
              </div>
              <h3 className="font-semibold text-xs">{option.label}</h3>
              <div className="text-sm font-bold text-primary mt-1">
                {option.size}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
