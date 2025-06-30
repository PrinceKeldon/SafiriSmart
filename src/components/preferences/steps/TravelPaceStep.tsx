
import React from 'react';
import { Card } from '@/components/ui/card';
import { Coffee, Zap, Target } from 'lucide-react';

interface TravelPaceStepProps {
  value: 'relaxed' | 'moderate' | 'active';
  onChange: (value: 'relaxed' | 'moderate' | 'active') => void;
}

export const TravelPaceStep: React.FC<TravelPaceStepProps> = ({ value, onChange }) => {
  const paceOptions = [
    {
      id: 'relaxed' as const,
      title: 'Relaxed',
      icon: Coffee,
      subtitle: 'Take it easy and enjoy',
      description: 'Slower pace with plenty of time to rest and soak in the experience',
      features: [
        'Leisurely game drives',
        'Longer stays at lodges',
        'Flexible schedule',
        'More downtime',
      ],
      timeExample: '2-3 activities per day',
    },
    {
      id: 'moderate' as const,
      title: 'Moderate',
      icon: Target,
      subtitle: 'Balanced adventure',
      description: 'Perfect balance of activity and relaxation for most travelers',
      features: [
        'Mix of activities',
        'Reasonable schedule',
        'Some flexibility',
        'Good variety',
      ],
      timeExample: '3-4 activities per day',
    },
    {
      id: 'active' as const,
      title: 'Active',
      icon: Zap,
      subtitle: 'Action-packed adventure',
      description: 'Fast-paced itinerary with maximum wildlife viewing and experiences',
      features: [
        'Early morning starts',
        'Full day activities',
        'Maximum wildlife viewing',
        'Action-packed schedule',
      ],
      timeExample: '4-5+ activities per day',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600">
          What kind of travel pace do you prefer for your safari adventure?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;
          
          return (
            <Card 
              key={option.id}
              className={`p-6 cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
              onClick={() => onChange(option.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{option.title}</h3>
                      <p className="text-sm text-gray-500">{option.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        {option.timeExample}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {option.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
