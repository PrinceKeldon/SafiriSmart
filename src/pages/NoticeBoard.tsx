
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import { useNoticeBoardLeads } from '@/hooks/useNoticeBoardLeads';
import { NoticeBoardCard } from '@/components/leads/NoticeBoardCard';
import { ClaimLeadModal } from '@/components/leads/ClaimLeadModal';
import { Loader2, Bell, AlertCircle } from 'lucide-react';

const NoticeBoard = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: leads, isLoading, error } = useNoticeBoardLeads();

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading available leads...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <span className="text-lg">Error loading leads: {error.message}</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Notice Board</h1>
            <p className="text-gray-600">Available leads matched to your expertise</p>
          </div>
        </div>

        {leads && leads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Available Leads</h3>
              <p className="text-gray-500 text-center mb-4">
                There are currently no new leads that match your services and destinations.
              </p>
              <p className="text-sm text-gray-400 text-center">
                New leads will appear here when they match your operator profile settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {leads?.length || 0} available lead{leads?.length !== 1 ? 's' : ''} matched to your expertise
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leads?.map((lead) => (
                <NoticeBoardCard
                  key={lead.id}
                  lead={lead as Lead}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </>
        )}

        <ClaimLeadModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </DashboardLayout>
  );
};

export default NoticeBoard;
