
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { 
  User, Mail, Phone, Globe, Calendar, MapPin, Users, 
  DollarSign, Clock, MessageSquare, Utensils, Plane 
} from 'lucide-react';

interface LeadOverviewProps {
  lead: Lead;
  onUpdateStatus?: (leadId: string, newStatus: Lead['status']) => void;
  onLeadUpdate?: (updatedLead: Lead) => void;
  readOnly?: boolean;
}

const STATUS_DISPLAY = {
  'unclaimed': { label: 'Unclaimed', color: 'bg-gray-100 text-gray-800' },
  'claimed': { label: 'Claimed', color: 'bg-blue-100 text-blue-800' },
  'contacted': { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  'quoted': { label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  'confirmed': { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
} as const;

export const LeadOverview: React.FC<LeadOverviewProps> = ({ lead, readOnly = false }) => {
  const preferences = lead.preferences || {};
  const currentStatus = STATUS_DISPLAY[lead.status as keyof typeof STATUS_DISPLAY] || STATUS_DISPLAY['claimed'];

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-semibold">{lead.traveler_name}</p>
                <p className="text-sm text-gray-500">Full Name</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-semibold">{lead.traveler_email}</p>
                <p className="text-sm text-gray-500">Email Address</p>
              </div>
            </div>

            {lead.traveler_phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-semibold">{lead.traveler_phone}</p>
                  <p className="text-sm text-gray-500">Phone Number</p>
                </div>
              </div>
            )}

            {lead.traveler_country && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-semibold">{lead.traveler_country}</p>
                  <p className="text-sm text-gray-500">Country</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Status - Now Display Only */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
            <p className="text-sm text-gray-500">
              Status updates automatically based on checklist progress
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Safari Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Safari Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-semibold">{preferences.duration || 'N/A'} days</p>
                <p className="text-sm text-gray-500">Duration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-semibold">{preferences.groupSize || preferences.group_size || 'N/A'}</p>
                <p className="text-sm text-gray-500">Group Size</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-semibold capitalize">{preferences.budgetRange || preferences.budget || 'N/A'}</p>
                <p className="text-sm text-gray-500">Budget</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-semibold capitalize">{preferences.travelPace || 'N/A'}</p>
                <p className="text-sm text-gray-500">Travel Pace</p>
              </div>
            </div>
          </div>

          {/* Interests */}
          {preferences.interests && preferences.interests.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Interests & Activities</h4>
              <div className="flex flex-wrap gap-2">
                {preferences.interests.map((interest: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {preferences.languages && preferences.languages.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Preferred Languages</h4>
              <div className="flex flex-wrap gap-2">
                {preferences.languages.map((language: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Travel Details */}
      {(preferences.travel || preferences.schedule) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Travel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.schedule && (
              <div>
                <h4 className="font-semibold mb-2">Travel Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {preferences.schedule.startDate && (
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-gray-600">{new Date(preferences.schedule.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {preferences.schedule.endDate && (
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-gray-600">{new Date(preferences.schedule.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Flexible Dates</p>
                    <p className="text-gray-600">{preferences.schedule.flexible ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}

            {preferences.travel && (
              <div>
                <h4 className="font-semibold mb-2">Travel Logistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {preferences.travel.portOfEntry && (
                    <div>
                      <p className="font-medium">Port of Entry</p>
                      <p className="text-gray-600">{preferences.travel.portOfEntry}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Airport Pickup</p>
                    <p className="text-gray-600">{preferences.travel.airportPickup ? 'Required' : 'Not required'}</p>
                  </div>
                  {preferences.travel.pickupTime && (
                    <div>
                      <p className="font-medium">Pickup Time</p>
                      <p className="text-gray-600">{preferences.travel.pickupTime}</p>
                    </div>
                  )}
                  {preferences.travel.pickupLocation && (
                    <div>
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-gray-600">{preferences.travel.pickupLocation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dietary Requirements */}
      {preferences.dietary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Dietary Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.dietary.mealWishes && (
              <div>
                <h4 className="font-semibold mb-2">Meal Preferences</h4>
                <p className="text-gray-600">{preferences.dietary.mealWishes}</p>
              </div>
            )}
            {preferences.dietary.allergies && (
              <div>
                <h4 className="font-semibold mb-2">Allergies & Restrictions</h4>
                <p className="text-gray-600">{preferences.dietary.allergies}</p>
              </div>
            )}
            {preferences.dietary.specialRequirements && (
              <div>
                <h4 className="font-semibold mb-2">Special Requirements</h4>
                <p className="text-gray-600">{preferences.dietary.specialRequirements}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Special Requests/Message */}
      {preferences.message && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Special Requests & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{preferences.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Quote Information */}
      {(lead.quoted_price || lead.quoted_currency) && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {lead.quoted_price} {lead.quoted_currency}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
