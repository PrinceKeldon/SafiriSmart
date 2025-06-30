
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const LoadingState: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center py-12">
        <CardContent>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Creating Your Perfect Safari...</h3>
          <p className="text-gray-600">Our AI is crafting a personalized itinerary based on your preferences</p>
        </CardContent>
      </Card>
    </div>
  );
};
