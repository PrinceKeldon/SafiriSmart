
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadsGrid } from '@/components/dashboard/LeadsGrid';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { useLeads, useUpdateLeadStatus } from '@/hooks/useLeads';
import { Lead } from '@/types/lead';
import { toast } from 'sonner';

const Dashboard = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { data: leadsData, isLoading, error, refetch } = useLeads();
  const updateLeadStatusMutation = useUpdateLeadStatus();

  // Handle different response formats from the API
  const leads: Lead[] = Array.isArray(leadsData) 
    ? leadsData 
    : (leadsData && typeof leadsData === 'object' && 'data' in leadsData && Array.isArray((leadsData as any).data))
      ? (leadsData as any).data
      : [];

  const handleViewDetails = (lead: Lead) => {
    console.log('Viewing lead details:', lead);
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await updateLeadStatusMutation.mutateAsync({ leadId, status: newStatus });
      toast.success('Lead status updated successfully');
      refetch(); // Refresh the leads data
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    console.log('Adding note to lead:', leadId, note);
    toast.info('Note functionality will be implemented soon');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-base sm:text-lg">Loading leads...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-base sm:text-lg text-red-600 text-center px-4">Error loading leads: {error.message}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to TourMaster AI!</p>
          </div>
          
          <Link to="/new-lead" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm sm:text-base font-bold">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>New Lead</span>
            </Button>
          </Link>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Stats Section */}
          <DashboardStats leads={leads} />

          {/* Leads Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Recent Leads</h2>
            {leads.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No leads yet</h3>
                  <p className="text-gray-500 text-center mb-4 px-4">
                    Start by creating your first lead to see them appear here
                  </p>
                  <Link to="/new-lead" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Lead
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <LeadsGrid
                leads={leads}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </div>
        </div>

        {/* Lead Detail Modal */}
        <LeadDetailModal
          lead={selectedLead}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLead(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
