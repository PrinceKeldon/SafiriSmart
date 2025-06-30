
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Phone, Mail, ArrowLeft } from 'lucide-react';

interface LeadConfirmationProps {
  onStartOver: () => void;
}

export const LeadConfirmation: React.FC<LeadConfirmationProps> = ({ onStartOver }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Request Submitted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-lg">
            Thank you for your interest in our Kenya safari experience. 
            Our local expert will review your preferences and get back to you soon.
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">What's Next?</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Expert review (within 2 hours)</li>
                <li>• Detailed itinerary customization</li>
                <li>• Accurate pricing and availability</li>
                <li>• Personal consultation call</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Contact Timeline</h3>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Initial response: 2-4 hours</li>
                <li>• Detailed proposal: 24 hours</li>
                <li>• Follow-up call: Within 48 hours</li>
                <li>• Booking confirmation: As needed</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3 flex items-center justify-center">
              <Mail className="w-4 h-4 mr-2" />
              Questions in the Meantime?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Feel free to reach out directly:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                info@safariguide.com
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                +254 700 123 456
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t">
            <Button 
              onClick={onStartOver}
              variant="ghost"
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Plan Another Safari
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
