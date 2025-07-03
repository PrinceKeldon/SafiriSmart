
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
  onUpdateStatus: (leadId: string, newStatus: Lead['status']) => void;
  onAddNote: (leadId: string, note: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.traveler_name}</DialogTitle>
          <DialogDescription>
            Lead Details and Management
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
                onUpdateStatus={onUpdateStatus}
              />
            </TabsContent>

            <TabsContent value="checklist" className="mt-6">
              {lead.todo_checklist && (
                <LeadChecklist 
                  leadId={lead.id}
                  todoChecklist={lead.todo_checklist}
                />
              )}
            </TabsContent>

            <TabsContent value="itinerary" className="mt-6">
              {lead.itinerary ? (
                <ItineraryView itinerary={lead.itinerary} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No itinerary available for this lead
                </div>
              )}
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
