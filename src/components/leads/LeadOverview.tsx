
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, DollarSign, Mail, MapPin, Phone, Users } from 'lucide-react';
import { Lead } from '@/types/lead';

interface LeadOverviewProps {
  lead: Lead;
  onUpdateStatus: (leadId: string, newStatus: Lead['status']) => void;
}

const statusColors = {
  unclaimed: 'bg-gray-100 text-gray-800',
  claimed: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  unclaimed: 'Unclaimed',
  claimed: 'Claimed',
  contacted: 'Contacted',
  quoted: 'Quote Sent',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const LeadOverview: React.FC<LeadOverviewProps> = ({ lead, onUpdateStatus }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const preferences = lead.preferences || {};
  const duration = preferences.duration || 'N/A';
  const groupSize = preferences.groupSize || 1;
  const budgetRange = preferences.budgetRange || 'mid-range';
  const interests = preferences.interests || [];
  const schedule = preferences.schedule || {};

  return (
    <div className="space-y-6">
      {/* Status and Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{lead.traveler_name}</CardTitle>
              <CardDescription>{lead.traveler_country}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusColors[lead.status]}>
                {statusLabels[lead.status]}
              </Badge>
              <Select
                value={lead.status}
                onValueChange={(value: Lead['status']) => onUpdateStatus(lead.id, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{lead.traveler_email}</span>
            </div>
            {lead.traveler_phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{lead.traveler_phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>Created: {formatDate(lead.created_at)}</span>
            </div>
            {lead.updated_at !== lead.created_at && (
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span>Updated: {formatDate(lead.updated_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trip Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{groupSize} {groupSize === 1 ? 'person' : 'people'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="capitalize">{budgetRange} budget</span>
            </div>
          </div>

          {/* Travel Dates */}
          {schedule.startDate && schedule.endDate && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Preferred Travel Dates:</h4>
              <p className="text-gray-600">
                {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                {schedule.flexible && <span className="text-blue-600 ml-1">(Flexible)</span>}
              </p>
            </div>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Interests:</h4>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Information */}
      {lead.quoted_price && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">
                    Quoted Price: {formatCurrency(lead.quoted_price, lead.quoted_currency || 'USD')}
                  </p>
                  <p className="text-sm text-green-600">
                    Per person for {duration} days
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
