
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Minus, Plus, User, Users } from 'lucide-react';

interface GroupSizeStepProps {
  value: number;
  onChange: (value: number) => void;
}

export const GroupSizeStep: React.FC<GroupSizeStepProps> = ({ value, onChange }) => {
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
    { size: 2, label: 'Couple', icon: User, description: 'Romantic getaway' },
    { size: 4, label: 'Small Group', icon: Users, description: 'Family or friends' },
    { size: 6, label: 'Family Group', icon: Users, description: 'Extended family' },
    { size: 8, label: 'Large Group', icon: Users, description: 'Group adventure' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-primary mb-2">
          {value} {value === 1 ? 'Traveler' : 'Travelers'}
        </div>
        <p className="text-gray-600">
          Group size affects vehicle options and accommodation arrangements
        </p>
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
              className={`p-4 cursor-pointer transition-all text-center ${
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5 shadow-sm'
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
              onClick={() => onChange(option.size)}
            >
              <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">{option.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              <div className="text-lg font-bold text-primary mt-1">
                {option.size}
              </div>
            </Card>
          );
        })}
      </div>

      {value > 8 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Large Group Notice:</strong> Groups larger than 8 may require special arrangements. 
            Our local experts will help coordinate the best safari vehicles and accommodations for your group.
          </p>
        </div>
      )}
    </div>
  );
};
