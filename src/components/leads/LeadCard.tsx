
import { useState } from 'react';
import { CalendarDays, DollarSign, MapPin, Users, Phone, Mail, Eye, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/lead';

interface LeadCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
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

export const LeadCard = ({ lead, onViewDetails, onUpdateStatus }: LeadCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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

  const handleStatusChange = async (newStatus: Lead['status']) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(lead.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Extract preferences from the lead data
  const preferences = lead.preferences || {};
  const duration = preferences.duration || 'N/A';
  const groupSize = preferences.groupSize || 1;
  const budgetRange = preferences.budgetRange || 'mid-range';
  const interests = preferences.interests || [];
  const schedule = preferences.schedule || {};

  // Calculate checklist progress
  const checklistProgress = lead.todo_checklist && lead.todo_checklist.length > 0
    ? {
        completed: lead.todo_checklist.filter(t => t.completed).length,
        total: lead.todo_checklist.length
      }
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg truncate">{lead.traveler_name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{lead.traveler_country || 'Unknown'}</p>
          </div>
          <div className="flex flex-col items-end gap-1 ml-2">
            <Badge className={`${statusColors[lead.status]} text-xs whitespace-nowrap`}>
              {statusLabels[lead.status]}
            </Badge>
            {checklistProgress && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                <span>{checklistProgress.completed}/{checklistProgress.total} tasks</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">Safari Adventure</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{duration} days</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{groupSize} {groupSize === 1 ? 'person' : 'people'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="capitalize truncate">{budgetRange}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{lead.traveler_email}</span>
          </div>
          {lead.traveler_phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{lead.traveler_phone}</span>
            </div>
          )}
        </div>

        {/* Travel Dates */}
        {schedule.startDate && schedule.endDate && (
          <div className="text-xs sm:text-sm">
            <p className="font-medium">Travel Dates:</p>
            <p className="text-gray-600">
              {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
              {schedule.flexible && <span className="text-blue-600 ml-1">(Flexible)</span>}
            </p>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div>
            <p className="text-xs sm:text-sm font-medium mb-2">Interests:</p>
            <div className="flex flex-wrap gap-1">
              {interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {interests.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{interests.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quote Info */}
        {lead.quoted_price && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-green-800">
              Quoted: {formatCurrency(lead.quoted_price, lead.quoted_currency || 'USD')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          <Button 
            onClick={() => onViewDetails(lead)} 
            variant="outline" 
            size="sm"
            className="flex-1 text-xs sm:text-sm"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            View Details
          </Button>
          
          {lead.status === 'claimed' && (
            <Button 
              onClick={() => handleStatusChange('contacted')} 
              size="sm"
              disabled={isUpdating}
              className="flex-1 text-xs sm:text-sm"
            >
              Mark Contacted
            </Button>
          )}
          
          {lead.status === 'contacted' && (
            <Button 
              onClick={() => handleStatusChange('quoted')} 
              size="sm"
              disabled={isUpdating}
              className="flex-1 text-xs sm:text-sm"
            >
              Send Quote
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 pt-2">
          Created: {formatDate(lead.created_at)}
        </p>
      </CardContent>
    </Card>
  );
};
