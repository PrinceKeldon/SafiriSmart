
import { useState } from 'react';
import { CalendarDays, DollarSign, MapPin, Users, Phone, Mail, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/api';

interface LeadCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  booked: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  new: 'New Lead',
  contacted: 'Contacted',
  quoted: 'Quote Sent',
  booked: 'Booked',
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

  const formatCurrency = (amount: number, currency: string) => {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{lead.traveler.name}</h3>
            <p className="text-sm text-gray-600">{lead.traveler.country}</p>
          </div>
          <Badge className={statusColors[lead.status]}>
            {statusLabels[lead.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{lead.preferences.destination}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>{lead.preferences.duration} days</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{lead.preferences.groupSize} {lead.preferences.groupSize === 1 ? 'person' : 'people'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>
              {formatCurrency(lead.preferences.budget.min, lead.preferences.budget.currency)} - {formatCurrency(lead.preferences.budget.max, lead.preferences.budget.currency)}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{lead.traveler.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{lead.traveler.phone}</span>
          </div>
        </div>

        {/* Travel Dates */}
        <div className="text-sm">
          <p className="font-medium">Travel Dates:</p>
          <p className="text-gray-600">
            {formatDate(lead.preferences.travelDates.startDate)} - {formatDate(lead.preferences.travelDates.endDate)}
            {lead.preferences.travelDates.flexible && <span className="text-blue-600 ml-1">(Flexible)</span>}
          </p>
        </div>

        {/* Interests */}
        <div>
          <p className="text-sm font-medium mb-2">Interests:</p>
          <div className="flex flex-wrap gap-1">
            {lead.preferences.interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quote Info */}
        {lead.quotedPrice && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Quoted: {formatCurrency(lead.quotedPrice, lead.quotedCurrency || 'USD')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={() => onViewDetails(lead)} 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {lead.status === 'new' && (
            <Button 
              onClick={() => handleStatusChange('contacted')} 
              size="sm"
              disabled={isUpdating}
            >
              Mark Contacted
            </Button>
          )}
          
          {lead.status === 'contacted' && (
            <Button 
              onClick={() => handleStatusChange('quoted')} 
              size="sm"
              disabled={isUpdating}
            >
              Send Quote
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 pt-2">
          Created: {formatDate(lead.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
};
