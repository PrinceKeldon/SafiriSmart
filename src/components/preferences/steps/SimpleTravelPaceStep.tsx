
import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, Camera } from 'lucide-react';

interface SimpleTravelPaceStepProps {
  value: 'relaxed' | 'moderate' | 'active';
  onChange: (value: 'relaxed' | 'moderate' | 'active') => void;
}

export const SimpleTravelPaceStep: React.FC<SimpleTravelPaceStepProps> = ({ value, onChange }) => {
  const paceOptions = [
    {
      id: 'relaxed' as const,
      title: 'Relaxed',
      icon: Clock,
      description: 'Take your time, enjoy the moment',
    },
    {
      id: 'moderate' as const,
      title: 'Moderate',
      icon: MapPin,
      description: 'Balanced mix of activities and relaxation',
    },
    {
      id: 'active' as const,
      title: 'Active',
      icon: Camera,
      description: 'Pack in as much as possible',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {paceOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.id;
        
        return (
          <Card 
            key={option.id}
            className={`p-4 cursor-pointer transition-all ${
              isSelected 
                ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
                : 'hover:bg-gray-50 hover:shadow-sm'
            }`}
            onClick={() => onChange(option.id)}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
