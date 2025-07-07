
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Camera } from 'lucide-react';

interface TravelPaceStepProps {
  value: 'relaxed' | 'moderate' | 'active';
  onChange: (value: 'relaxed' | 'moderate' | 'active') => void;
}

export const TravelPaceStep: React.FC<TravelPaceStepProps> = ({ value, onChange }) => {
  const paceOptions = [
    {
      id: 'relaxed' as const,
      title: 'Relaxed',
      icon: Clock,
      description: 'Take your time, enjoy the moment',
      features: ['Longer stays at each location', 'More leisure time', 'Fewer daily activities', 'Flexible schedule'],
      popular: false,
    },
    {
      id: 'moderate' as const,
      title: 'Moderate',
      icon: MapPin,
      description: 'Balanced mix of activities and relaxation',
      features: ['Good balance of activities', 'Some leisure time', 'Moderate daily schedule', 'Mix of active and relaxed'],
      popular: true,
    },
    {
      id: 'active' as const,
      title: 'Active',
      icon: Camera,
      description: 'Pack in as much as possible',
      features: ['Action-packed itinerary', 'Early morning starts', 'Multiple activities daily', 'Maximum wildlife viewing'],
      popular: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600">
          Choose the pace that matches your travel style
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;
          
          return (
            <Card 
              key={option.id}
              className={`p-6 cursor-pointer transition-all relative ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
              onClick={() => onChange(option.id)}
            >
              {option.popular && (
                <Badge className="absolute -top-2 left-6 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  
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
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
