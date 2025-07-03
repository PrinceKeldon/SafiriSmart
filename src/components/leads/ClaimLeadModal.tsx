
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { useClaimLead } from '@/hooks/useNoticeBoardLeads';
import { Calendar, MapPin, Users, DollarSign, Phone, Mail, Globe, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ClaimLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimLeadModal: React.FC<ClaimLeadModalProps> = ({ lead, isOpen, onClose }) => {
  const claimLead = useClaimLead();

  if (!lead) return null;

  const preferences = lead.preferences || {};
  const duration = preferences.duration || 'N/A';
  const destination = preferences.destination || 'Various locations';
  const groupSize = preferences.groupSize || preferences.group_size || 'N/A';
  const budget = preferences.budgetRange || preferences.budget || 'Not specified';
  const interests = preferences.interests || [];

  const handleClaim = async () => {
    await claimLead.mutateAsync(lead.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{lead.traveler_name}</DialogTitle>
              <DialogDescription>Lead Details & Claiming</DialogDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Available
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Traveler Information */}
          <div>
            <h3 className="font-semibold mb-3">Traveler Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{lead.traveler_email}</span>
              </div>
              {lead.traveler_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{lead.traveler_phone}</span>
                </div>
              )}
              {lead.traveler_country && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span>{lead.traveler_country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trip Preferences */}
          <div>
            <h3 className="font-semibold mb-3">Trip Preferences</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium">Destination:</span>
                  <div className="text-gray-600">{destination}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium">Duration:</span>
                  <div className="text-gray-600">{duration} days</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium">Group Size:</span>
                  <div className="text-gray-600">{groupSize} travelers</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium">Budget:</span>
                  <div className="text-gray-600 capitalize">{budget}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          {interests.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Preview */}
          {lead.itinerary && (
            <div>
              <h3 className="font-semibold mb-3">Generated Itinerary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{lead.itinerary.title || 'Custom Safari Experience'}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  {lead.itinerary.overview || 'Detailed itinerary available after claiming'}
                </p>
              </div>
            </div>
          )}

          {/* Lead Age */}
          <div className="text-xs text-gray-500 border-t pt-3">
            Lead received {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleClaim}
            disabled={claimLead.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {claimLead.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim This Lead'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
