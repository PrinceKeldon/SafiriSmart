
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Eye, RefreshCw, Calendar } from 'lucide-react';
import { useArchivedLeads } from '@/hooks/useArchivedLeads';
import { Lead } from '@/types/lead';
import { LeadDetailModal } from './LeadDetailModal';
import { format } from 'date-fns';

export const ArchivedLeadsSection: React.FC = () => {
  const { data: archivedLeads, isLoading, error, refetch, isRefetching } = useArchivedLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (leadData: any) => {
    const lead: Lead = {
      id: leadData.id,
      status: leadData.status as Lead['status'],
      assigned_operator_id: leadData.assigned_operator_id,
      traveler_name: leadData.traveler_name,
      traveler_email: leadData.traveler_email,
      traveler_phone: leadData.traveler_phone,
      traveler_country: leadData.traveler_country,
      preferences: leadData.preferences as any,
      itinerary: leadData.itinerary as any,
      quoted_price: leadData.quoted_price,
      quoted_currency: leadData.quoted_currency,
      todo_checklist: (leadData.todo_checklist as any) || [],
      created_at: leadData.created_at,
      updated_at: leadData.updated_at,
    };
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading archived leads...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading archived leads</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              <CardTitle>Archived Leads</CardTitle>
              <Badge variant="secondary">{archivedLeads?.length || 0}</Badge>
            </div>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={isRefetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {archivedLeads && archivedLeads.length > 0 ? (
            <div className="space-y-3">
              {archivedLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{lead.traveler_name}</h4>
                      <Badge 
                        variant={lead.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{lead.traveler_email}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Completed: {format(new Date(lead.updated_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {lead.quoted_price && (
                        <span className="font-medium text-green-600">
                          {lead.quoted_currency} {lead.quoted_price}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(lead)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Archived Leads</h3>
              <p className="text-muted-foreground">
                Completed leads will appear here for your reference.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDetailModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdateStatus={() => {}} // Read-only for archived leads
        onAddNote={() => {}} // Read-only for archived leads
        readOnly={true}
      />
    </>
  );
};
