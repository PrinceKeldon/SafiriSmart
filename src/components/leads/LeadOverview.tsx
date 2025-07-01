
import { MapPin, CalendarDays, Users, DollarSign, Mail, Phone, Globe } from 'lucide-react';
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
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
            <p className="font-medium">{lead.traveler_name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">{lead.traveler_email}</p>
            </div>
            {lead.traveler_phone && (
              <div className="flex items-center space-x-2 mt-1">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">{lead.traveler_phone}</p>
              </div>
            )}
            {lead.traveler_country && (
              <div className="flex items-center space-x-2 mt-1">
                <Globe className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">{lead.traveler_country}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{lead.preferences.groupSize || 1} travelers</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm capitalize">{lead.preferences.budgetRange || 'mid-range'}</span>
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
              <span>Safari Adventure</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>{lead.preferences.duration || 'N/A'} days</span>
            </div>
          </div>

          {/* Quote Information */}
          {lead.quoted_price && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Quoted: {formatCurrency(lead.quoted_price, lead.quoted_currency)}
              </p>
            </div>
          )}

          {/* Travel Dates */}
          {lead.preferences.schedule?.startDate && lead.preferences.schedule?.endDate && (
            <div>
              <p className="font-medium mb-2">Travel Dates:</p>
              <p className="text-sm">
                {formatDate(lead.preferences.schedule.startDate)} - {formatDate(lead.preferences.schedule.endDate)}
                {lead.preferences.schedule.flexible && <span className="text-blue-600 ml-2">(Flexible dates)</span>}
              </p>
            </div>
          )}

          {/* Travel Logistics */}
          {lead.preferences.travel && (
            <div>
              <p className="font-medium mb-2">Travel Details:</p>
              {lead.preferences.travel.portOfEntry && (
                <p className="text-sm">Entry Point: {lead.preferences.travel.portOfEntry}</p>
              )}
              {lead.preferences.travel.airportPickup && (
                <p className="text-sm">Airport Pickup: Yes</p>
              )}
            </div>
          )}

          {/* Interests */}
          {lead.preferences.interests && lead.preferences.interests.length > 0 && (
            <div>
              <p className="font-medium mb-2">Interests:</p>
              <div className="flex flex-wrap gap-2">
                {lead.preferences.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {lead.preferences.languages && lead.preferences.languages.length > 0 && (
            <div>
              <p className="font-medium mb-2">Languages:</p>
              <div className="flex flex-wrap gap-2">
                {lead.preferences.languages.map((language, index) => (
                  <Badge key={index} variant="outline">{language}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Requirements */}
          {lead.preferences.dietary && (
            <div>
              <p className="font-medium mb-2">Dietary Requirements:</p>
              <div className="text-sm space-y-1">
                {lead.preferences.dietary.mealWishes && (
                  <p>Meal Preferences: {lead.preferences.dietary.mealWishes}</p>
                )}
                {lead.preferences.dietary.allergies && (
                  <p>Allergies: {lead.preferences.dietary.allergies}</p>
                )}
                {lead.preferences.dietary.specialRequirements && (
                  <p>Special Requirements: {lead.preferences.dietary.specialRequirements}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
