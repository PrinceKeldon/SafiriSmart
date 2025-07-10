
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/lead';
import { MapPin, Calendar, Users, DollarSign, Eye, UserCheck } from 'lucide-react';

interface NoticeBoardCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  showClaimButton?: boolean;
  onClaim?: (leadId: string) => void;
}

export const NoticeBoardCard: React.FC<NoticeBoardCardProps> = ({ 
  lead, 
  onViewDetails, 
  showClaimButton = true,
  onClaim 
}) => {
  const preferences = lead.preferences || {};
  const itinerary = lead.itinerary || {};
  
  const getBudgetBadgeColor = (budget: string) => {
    switch (budget?.toLowerCase()) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'mid-range': return 'bg-blue-100 text-blue-800';
      case 'luxury': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {lead.traveler_name}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {formatDate(lead.created_at)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{lead.traveler_country}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{preferences.duration || 'N/A'} days</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{preferences.groupSize || 'N/A'} people</span>
          </div>
        </div>

        {/* Budget */}
        {preferences.budgetRange && (
          <div className="flex justify-center">
            <Badge className={getBudgetBadgeColor(preferences.budgetRange)}>
              {preferences.budgetRange}
            </Badge>
          </div>
        )}

        {/* Interests */}
        {preferences.interests && preferences.interests.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Interests:</p>
            <div className="flex flex-wrap gap-1">
              {preferences.interests.slice(0, 3).map((interest: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {preferences.interests.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{preferences.interests.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Estimated Cost */}
        {itinerary?.estimatedCost && (
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="font-medium">
              ~${itinerary.estimatedCost.amount?.toLocaleString()} {itinerary.estimatedCost.currency}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(lead)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          
          {showClaimButton && onClaim && (
            <Button 
              size="sm" 
              onClick={() => onClaim(lead.id)}
              className="flex-1"
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Claim Lead
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
