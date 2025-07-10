import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Star, Crown } from 'lucide-react';

interface BudgetStepProps {
  value: 'budget' | 'mid-range' | 'luxury';
  onChange: (value: 'budget' | 'mid-range' | 'luxury') => void;
  onNext: () => void;
  onBack: () => void;
}

export const BudgetStep: React.FC<BudgetStepProps> = ({ value, onChange, onNext, onBack }) => {
  const budgetOptions = [
    {
      id: 'budget' as const,
      title: 'Budget',
      icon: DollarSign,
      priceRange: '$150-300/day',
      description: 'Comfortable accommodations, shared game drives, local experiences',
      features: ['Comfortable lodges', 'Shared safari vehicles', 'Group activities', 'Local guides'],
      popular: false,
    },
    {
      id: 'mid-range' as const,
      title: 'Mid-Range',
      icon: Star,
      priceRange: '$300-600/day',
      description: 'Quality accommodations, private/semi-private vehicles, balanced experiences',
      features: ['Quality tented camps', 'Semi-private vehicles', 'Flexible itinerary', 'Experienced guides'],
      popular: true,
    },
    {
      id: 'luxury' as const,
      title: 'Luxury',
      icon: Crown,
      priceRange: '$600+/day',
      description: 'Premium accommodations, private vehicles, exclusive experiences',
      features: ['Luxury lodges', 'Private vehicles & guides', 'Exclusive access', 'Premium amenities'],
      popular: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600">
          Choose the experience level that matches your travel style
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {budgetOptions.map((option) => {
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{option.title}</h3>
                    <span className="text-lg font-bold text-primary">
                      {option.priceRange}
                    </span>
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
              </div>
            </Card>
          );
        })}
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
