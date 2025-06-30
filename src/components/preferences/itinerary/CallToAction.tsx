
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar } from 'lucide-react';

interface CallToActionProps {
  onConnectExpert: () => void;
  onRequestQuote: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  onConnectExpert,
  onRequestQuote
}) => {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Make This Safari a Reality?
          </h3>
          <p className="text-gray-600 mb-6">
            Connect with our local experts to customize your itinerary and get detailed pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="flex items-center" onClick={onConnectExpert}>
              <Users className="w-5 h-5 mr-2" />
              Connect with Local Expert
            </Button>
            <Button size="lg" variant="outline" className="flex items-center" onClick={onRequestQuote}>
              <Calendar className="w-5 h-5 mr-2" />
              Request Detailed Quote
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
