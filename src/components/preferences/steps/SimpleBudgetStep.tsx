
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Star, Crown } from 'lucide-react';

interface SimpleBudgetStepProps {
  value: 'budget' | 'mid-range' | 'luxury';
  onChange: (value: 'budget' | 'mid-range' | 'luxury') => void;
}

export const SimpleBudgetStep: React.FC<SimpleBudgetStepProps> = ({ value, onChange }) => {
  const budgetOptions = [
    {
      id: 'budget' as const,
      title: 'Budget',
      icon: DollarSign,
      priceRange: '$150-300/day',
      description: 'Comfortable accommodations, shared game drives',
      popular: false,
    },
    {
      id: 'mid-range' as const,
      title: 'Mid-Range',
      icon: Star,
      priceRange: '$300-600/day',
      description: 'Quality accommodations, semi-private vehicles',
      popular: true,
    },
    {
      id: 'luxury' as const,
      title: 'Luxury',
      icon: Crown,
      priceRange: '$600+/day',
      description: 'Premium accommodations, private vehicles',
      popular: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {budgetOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.id;
        
        return (
          <Card 
            key={option.id}
            className={`p-4 cursor-pointer transition-all relative ${
              isSelected 
                ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
                : 'hover:bg-gray-50 hover:shadow-sm'
            }`}
            onClick={() => onChange(option.id)}
          >
            {option.popular && (
              <Badge className="absolute -top-2 left-4 bg-primary text-xs">
                Most Popular
              </Badge>
            )}
            
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{option.title}</h3>
                  <span className="font-bold text-primary text-sm">
                    {option.priceRange}
                  </span>
                </div>
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
