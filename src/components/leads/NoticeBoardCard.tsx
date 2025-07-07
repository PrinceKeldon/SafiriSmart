
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { Calendar, MapPin, Users, DollarSign, Eye, Phone, Mail, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NoticeBoardCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
}

export const NoticeBoardCard: React.FC<NoticeBoardCardProps> = ({ lead, onViewDetails }) => {
  const preferences = lead.preferences || {};
  const duration = preferences.duration || 'N/A';
  const destination = preferences.destination || 'Various locations';
  const groupSize = preferences.groupSize || preferences.group_size || 'N/A';
  const budget = preferences.budgetRange || preferences.budget || 'Not specified';

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {lead.traveler_name}
              {lead.traveler_country && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  {lead.traveler_country}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {lead.traveler_email}
            </CardDescription>
            {lead.traveler_phone && (
              <CardDescription className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4" />
                {lead.traveler_phone}
              </CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            New Lead
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Safari Requirements */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="truncate">{destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{groupSize} travelers</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="capitalize">{budget}</span>
            </div>
          </div>

          {/* Interests/Activities */}
          {preferences.interests && preferences.interests.length > 0 && (
            <div className="text-sm">
              <strong className="text-gray-700">Interests:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.interests.slice(0, 3).map((interest: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {preferences.interests.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{preferences.interests.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Special Notes/Message */}
          {preferences.message && (
            <div className="text-sm">
              <strong className="text-gray-700">Special Requests:</strong>
              <p className="text-gray-600 mt-1 line-clamp-2">
                {preferences.message}
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Received {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </div>
          
          <Button 
            onClick={() => onViewDetails(lead)}
            className="w-full mt-4"
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details & Claim
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
