
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Mountain, Users, Waves, TreePine, Compass, Bird, Car } from 'lucide-react';

interface InterestsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const InterestsStep: React.FC<InterestsStepProps> = ({ value, onChange, onNext, onBack }) => {
  const interestOptions = [
    {
      id: 'wildlife-safari',
      label: 'Wildlife Safari',
      icon: TreePine,
      description: 'Big Five game drives and animal watching',
    },
    {
      id: 'photography',
      label: 'Photography',
      icon: Camera,
      description: 'Capture stunning wildlife and landscapes',
    },
    {
      id: 'cultural',
      label: 'Cultural Experiences',
      icon: Users,
      description: 'Local communities and traditions',
    },
    {
      id: 'adventure',
      label: 'Adventure Activities',
      icon: Mountain,
      description: 'Hiking, climbing, and active pursuits',
    },
    {
      id: 'beach',
      label: 'Beach & Coast',
      icon: Waves,
      description: 'Coastal relaxation and water activities',
    },
    {
      id: 'bird-watching',
      label: 'Bird Watching',
      icon: Bird,
      description: 'Ornithology and birding experiences',
    },
    {
      id: 'conservation',
      label: 'Conservation',
      icon: Compass,
      description: 'Wildlife conservation and research',
    },
    {
      id: 'luxury-travel',
      label: 'Luxury Travel',
      icon: Car,
      description: 'Premium accommodations and services',
    },
  ];

  const toggleInterest = (interestId: string) => {
    if (value.includes(interestId)) {
      onChange(value.filter(id => id !== interestId));
    } else {
      onChange([...value, interestId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Select all activities and experiences that interest you (choose multiple)
        </p>
        {value.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {value.map((interestId) => {
              const interest = interestOptions.find(opt => opt.id === interestId);
              return (
                <Badge key={interestId} variant="secondary">
                  {interest?.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interestOptions.map((interest) => {
          const Icon = interest.icon;
          const isSelected = value.includes(interest.id);
          
          return (
            <div
              key={interest.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => toggleInterest(interest.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    isSelected ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {interest.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {interest.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={true}
        >
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={value.length === 0}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
