
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/types/lead';
import { LeadOverview } from './LeadOverview';
import { ItineraryView } from './ItineraryView';
import { NotesActions } from './NotesActions';
import { LeadChecklist } from './LeadChecklist';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (leadId: string, newStatus: Lead['status']) => void; // Made optional
  onAddNote: (leadId: string, note: string) => void;
  onLeadUpdate?: (updatedLead: Lead) => void; // New prop for handling lead updates
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateStatus, // Not used anymore since status is auto-managed
  onAddNote,
  onLeadUpdate, // New prop
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!lead) return null;

  console.log('🎯 LeadDetailModal: Lead data received:', {
    leadId: lead.id,
    status: lead.status,
    hasItinerary: !!lead.itinerary,
    checklistItems: lead.todo_checklist?.length || 0,
    itineraryType: typeof lead.itinerary,
    itineraryKeys: lead.itinerary ? Object.keys(lead.itinerary) : [],
    itinerary: lead.itinerary
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.traveler_name}</DialogTitle>
          <DialogDescription>
            Lead Details and Management - Status updates automatically based on checklist progress
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="notes">Notes & Actions</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="overview" className="mt-6">
              <LeadOverview 
                lead={lead}
                // Removed onUpdateStatus since status is now auto-managed
              />
            </TabsContent>

            <TabsContent value="checklist" className="mt-6">
              {lead.todo_checklist && (
                <LeadChecklist 
                  leadId={lead.id}
                  todoChecklist={lead.todo_checklist}
                  leadStatus={lead.status}
                  onLeadUpdate={onLeadUpdate}
                />
              )}
            </TabsContent>

            <TabsContent value="itinerary" className="mt-6">
              <ItineraryView itinerary={lead.itinerary} />
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <NotesActions 
                leadId={lead.id}
                onAddNote={onAddNote}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
