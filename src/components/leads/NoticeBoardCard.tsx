
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { Calendar, MapPin, Users, DollarSign, Eye } from 'lucide-react';
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
          <div>
            <CardTitle className="text-lg">{lead.traveler_name}</CardTitle>
            <CardDescription>{lead.traveler_email}</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            New Lead
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
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
          
          {lead.traveler_country && (
            <div className="text-sm text-gray-600">
              <strong>From:</strong> {lead.traveler_country}
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
