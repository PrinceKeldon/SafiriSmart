
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/types/lead';
import { useLeads } from '@/hooks/useLeads';
import { NoticeBoardCard } from '@/components/leads/NoticeBoardCard';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { ArchivedLeadsSection } from '@/components/leads/ArchivedLeadsSection';
import { Loader2, Inbox, AlertCircle, RefreshCw, Archive } from 'lucide-react';

const LeadInbox = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch active leads only (non-archived)
  const { data: leads, isLoading, error, refetch, isRefetching } = useLeads({ includeArchived: false });

  // Debug logging when component mounts
  useEffect(() => {
    console.log('🎯 Lead Inbox page component mounted');
    console.log('📊 Current leads data:', leads);
    console.log('⏳ Is loading:', isLoading);
    console.log('❌ Error:', error);
  }, [leads, isLoading, error]);

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  };

  // New function to handle lead updates
  const handleLeadUpdate = (updatedLead: Lead) => {
    console.log('🔄 Handling lead update in LeadInbox:', updatedLead);
    
    // Update the selected lead if it's the one being updated
    if (selectedLead?.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
    
    // Trigger a refetch to ensure the list is updated
    refetch();
  };

  const handleUpdateStatus = (leadId: string, newStatus: Lead['status']) => {
    console.log('Updating lead status:', leadId, newStatus);
    // TODO: Implement status update logic if needed
  };

  const handleAddNote = (leadId: string, note: string) => {
    console.log('Adding note to lead:', leadId, note);
    // TODO: Implement note adding logic if needed
  };

  // Filter leads by status for display
  const newLeads = leads?.filter(lead => lead.status === 'new') || [];
  const activeLeads = leads?.filter(lead => ['contacted', 'quoted', 'confirmed'].includes(lead.status)) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading your lead inbox...</span>
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
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <span className="text-lg">Error loading leads: {error.message}</span>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Inbox className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Lead Management</h1>
              <p className="text-gray-600">Manage your active and archived safari inquiries</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Active Leads
              <Badge variant="secondary" className="ml-1">
                {(newLeads.length + activeLeads.length) || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archived
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {newLeads.length} New
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {activeLeads.length} Active
                </Badge>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={isRefetching}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {leads && leads.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Inbox className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Leads</h3>
                  <p className="text-gray-500 text-center mb-4">
                    You currently have no active leads in your inbox.
                  </p>
                  <p className="text-sm text-gray-400 text-center mb-4">
                    New leads will appear here when travelers select your operation through SafariGuide AI.
                  </p>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check for New Leads
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* New Leads Section */}
                {newLeads.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xl font-semibold">New Leads</h2>
                      <Badge className="bg-blue-100 text-blue-800">{newLeads.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {newLeads.map((leadData) => {
                        // Convert Supabase data to Lead type
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

                        return (
                          <NoticeBoardCard
                            key={lead.id}
                            lead={lead}
                            onViewDetails={handleViewDetails}
                            showClaimButton={false}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Leads Section */}
                {activeLeads.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xl font-semibold">Active Leads</h2>
                      <Badge className="bg-green-100 text-green-800">{activeLeads.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeLeads.map((leadData) => {
                        // Convert Supabase data to Lead type
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

                        return (
                          <NoticeBoardCard
                            key={lead.id}
                            lead={lead}
                            onViewDetails={handleViewDetails}
                            showClaimButton={false}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="archived">
            <ArchivedLeadsSection />
          </TabsContent>
        </Tabs>

        <LeadDetailModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
          onLeadUpdate={handleLeadUpdate}
        />
      </div>
    </DashboardLayout>
  );
};

export default LeadInbox;
