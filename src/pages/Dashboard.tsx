
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { mockLeads } from '@/data/mockData';
import { Lead } from '@/types/api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
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

  // Statistics
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const quoted = leads.filter(l => l.status === 'quoted').length;
    const booked = leads.filter(l => l.status === 'booked').length;
    
    return { total, newLeads, quoted, booked };
  }, [leads]);

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
    // Simulate API call
    console.log(`Updating lead ${leadId} status to ${newStatus}`);
    
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
          : lead
      )
    );
    
    // Update selected lead if it's the one being updated
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    // Simulate API call
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
    
    // Update selected lead if it's the one being updated
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
    // Simulate API call
    console.log(`Deleting lead ${leadId}`);
    
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
    
    // Close modal if the deleted lead was selected
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
      setIsDetailModalOpen(false);
    }
  };

  const handleUpdateItinerary = async (leadId: string, updatedItinerary: any) => {
    // Simulate API call
    console.log(`Updating itinerary for lead ${leadId}:`, updatedItinerary);
    
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, itinerary: updatedItinerary, updatedAt: new Date().toISOString() }
          : lead
      )
    );
    
    // Update selected lead if it's the one being updated
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => 
        prev ? { ...prev, itinerary: updatedItinerary } : null
      );
    }
  };

  const handleSendItinerary = async (leadId: string) => {
    // Simulate API call
    console.log(`Sending itinerary for lead ${leadId}`);
    
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">New Leads</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.newLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Quotes Sent</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.quoted}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Bookings</h3>
            <p className="text-2xl font-bold text-green-600">{stats.booked}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}

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
