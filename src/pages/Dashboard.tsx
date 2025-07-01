
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
import { Lead } from '@/types/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { data: leadsResponse, isLoading, error } = useLeads();
  const updateLeadStatusMutation = useUpdateLeadStatus();

  // Extract leads from response - handle both array and object response formats
  const leads = Array.isArray(leadsResponse) 
    ? leadsResponse 
    : (leadsResponse?.success && leadsResponse.data ? leadsResponse.data : []);

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await updateLeadStatusMutation.mutateAsync({ leadId, status: newStatus });
      toast.success('Lead status updated successfully');
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    // This will be implemented when the user requests it
    console.log('Add note functionality not yet implemented');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading leads...</div>
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
            <div className="text-lg text-red-600">Error loading leads: {error.message}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to TourMaster AI!</p>
          </div>
          
          <Link to="/new-lead">
            <Button size="lg" className="flex items-center space-x-2 text-base font-bold">
              <Plus className="h-5 w-5" />
              <span>New Lead</span>
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Stats Section */}
          <DashboardStats leads={leads} />

          {/* Leads Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Leads</h2>
            <LeadsGrid
              leads={leads}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
            />
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
