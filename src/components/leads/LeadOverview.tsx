
import { MapPin, CalendarDays, Users, DollarSign, Bed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/api';

interface LeadOverviewProps {
  lead: Lead;
}

export const LeadOverview = ({ lead }: LeadOverviewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Traveler Information */}
      <Card>
        <CardHeader>
          <CardTitle>Traveler Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">{lead.traveler.name}</p>
            <p className="text-sm text-gray-600">{lead.traveler.email}</p>
            <p className="text-sm text-gray-600">{lead.traveler.phone}</p>
            <p className="text-sm text-gray-600">{lead.traveler.country}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{lead.preferences.groupSize} travelers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bed className="h-4 w-4 text-gray-400" />
              <span className="text-sm capitalize">{lead.preferences.accommodationType}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{lead.preferences.destination}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>{lead.preferences.duration} days</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>
                {formatCurrency(lead.preferences.budget.min, lead.preferences.budget.currency)} - {formatCurrency(lead.preferences.budget.max, lead.preferences.budget.currency)}
              </span>
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Travel Dates:</p>
            <p className="text-sm">
              {formatDate(lead.preferences.travelDates.startDate)} - {formatDate(lead.preferences.travelDates.endDate)}
              {lead.preferences.travelDates.flexible && <span className="text-blue-600 ml-2">(Flexible dates)</span>}
            </p>
          </div>

          <div>
            <p className="font-medium mb-2">Interests:</p>
            <div className="flex flex-wrap gap-2">
              {lead.preferences.interests.map((interest, index) => (
                <Badge key={index} variant="secondary">{interest}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
