
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { LeadsGrid } from '@/components/dashboard/LeadsGrid';
import { mockLeads } from '@/data/mockData';
import { Lead } from '@/types/api';

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.traveler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.traveler.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.preferences.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
    console.log(`Updating lead ${leadId} status to ${newStatus}`);
    
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
          : lead
      )
    );
    
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    console.log(`Adding note to lead ${leadId}: ${note}`);
    
    const timestamp = new Date().toISOString();
    const noteWithTimestamp = `[${new Date().toLocaleString()}] ${note}`;
    
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { 
              ...lead, 
              notes: [...lead.notes, noteWithTimestamp],
              updatedAt: timestamp
            }
          : lead
      )
    );
    
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => 
        prev ? { 
          ...prev, 
          notes: [...prev.notes, noteWithTimestamp] 
        } : null
      );
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    console.log(`Deleting lead ${leadId}`);
    
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
    
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
      setIsDetailModalOpen(false);
    }
  };

  const handleUpdateItinerary = async (leadId: string, updatedItinerary: any) => {
    console.log(`Updating itinerary for lead ${leadId}:`, updatedItinerary);
    
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, itinerary: updatedItinerary, updatedAt: new Date().toISOString() }
          : lead
      )
    );
    
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => 
        prev ? { ...prev, itinerary: updatedItinerary } : null
      );
    }
  };

  const handleSendItinerary = async (leadId: string) => {
    console.log(`Sending itinerary for lead ${leadId}`);
    return Promise.resolve();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your safari leads and bookings</p>
          </div>
          <Link to="/dashboard/leads/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        <DashboardStats leads={leads} />

        {/* Filters */}
        <DashboardFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Results */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
          {statusFilter !== 'all' && (
            <Badge variant="secondary">
              Filtered by: {statusFilter}
            </Badge>
          )}
        </div>

        {/* Leads Grid */}
        <LeadsGrid
          leads={filteredLeads}
          onViewDetails={handleViewDetails}
          onUpdateStatus={handleUpdateStatus}
        />

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
          onDeleteLead={handleDeleteLead}
          onUpdateItinerary={handleUpdateItinerary}
          onSendItinerary={handleSendItinerary}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
