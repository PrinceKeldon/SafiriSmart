
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Calendar, Info } from 'lucide-react';
import { TravelPreferences } from './WizardTypes';

interface PriceEstimationProps {
  preferences: TravelPreferences;
}

// Export the calculation function for reuse
export const calculatePriceRange = (preferences: TravelPreferences) => {
  const basePricePerDay = {
    budget: 150,
    'mid-range': 350,
    luxury: 800
  };

  const basePrice = basePricePerDay[preferences.budgetRange] * preferences.duration;
  const groupDiscount = preferences.groupSize > 2 ? 0.9 : 1;
  const finalPrice = basePrice * groupDiscount;

  return {
    min: Math.round(finalPrice * 0.85),
    max: Math.round(finalPrice * 1.15),
    perPerson: Math.round(finalPrice / preferences.groupSize)
  };
};

export const PriceEstimation: React.FC<PriceEstimationProps> = ({ preferences }) => {
  const priceRange = calculatePriceRange(preferences);
  
  const getBudgetColor = () => {
    switch (preferences.budgetRange) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'mid-range': return 'bg-blue-100 text-blue-800';
      case 'luxury': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostBreakdown = () => {
    const total = priceRange.max;
    return {
      accommodation: Math.round(total * 0.4),
      transport: Math.round(total * 0.25),
      activities: Math.round(total * 0.2),
      meals: Math.round(total * 0.15)
    };
  };

  const breakdown = getCostBreakdown();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <DollarSign className="w-5 h-5 mr-2" />
          Estimated Price Range
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">
                ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                ${priceRange.perPerson.toLocaleString()} per person ({preferences.groupSize} travelers)
              </div>
            </div>
            <Badge className={getBudgetColor()}>
              {preferences.budgetRange.charAt(0).toUpperCase() + preferences.budgetRange.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accommodation</span>
                <span className="font-medium">${breakdown.accommodation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transport</span>
                <span className="font-medium">${breakdown.transport.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Activities</span>
                <span className="font-medium">${breakdown.activities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Meals</span>
                <span className="font-medium">${breakdown.meals.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-3 border-t">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-gray-600">
              Prices are estimates and may vary based on specific accommodations, seasonal rates, and availability. 
              Final pricing will be provided by our local experts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
