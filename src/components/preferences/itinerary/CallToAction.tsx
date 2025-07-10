
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar } from 'lucide-react';

interface CallToActionProps {
  onSelectOperators: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  onSelectOperators
}) => {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Make This Safari a Reality?
          </h3>
          <p className="text-gray-600 mb-6">
            Choose from our trusted safari operators to get personalized quotes for your adventure.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="flex items-center" onClick={onSelectOperators}>
              <Users className="w-5 h-5 mr-2" />
              Select Operators & Get Quotes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
