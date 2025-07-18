
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lead } from '@/types/lead';
import { LeadOverview } from './LeadOverview';
import { ItineraryView } from './ItineraryView';
import { LeadChecklist } from './LeadChecklist';
import { NotesActions } from './NotesActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (leadId: string, newStatus: Lead['status']) => void;
  onAddNote: (leadId: string, note: string) => void;
  onLeadUpdate?: (updatedLead: Lead) => void;
  readOnly?: boolean;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
  onLeadUpdate,
  readOnly = false
}) => {
  const [currentLead, setCurrentLead] = useState<Lead | null>(lead);

  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  const handleLeadUpdate = (updatedLead: Lead) => {
    setCurrentLead(updatedLead);
    if (onLeadUpdate) {
      onLeadUpdate(updatedLead);
    }
  };

  if (!currentLead) return null;

  const isArchived = readOnly;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Safari Inquiry - {currentLead.traveler_name}
            {isArchived && (
              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                Archived
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="checklist" disabled={isArchived}>Checklist</TabsTrigger>
            <TabsTrigger value="notes" disabled={isArchived}>Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <LeadOverview 
              lead={currentLead} 
              onLeadUpdate={handleLeadUpdate}
              readOnly={isArchived}
            />
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-4">
            <ItineraryView 
              lead={currentLead} 
              onLeadUpdate={handleLeadUpdate}
              readOnly={isArchived}
            />
          </TabsContent>

          {!isArchived && (
            <>
              <TabsContent value="checklist" className="space-y-4">
                <LeadChecklist 
                  lead={currentLead} 
                  onLeadUpdate={handleLeadUpdate}
                />
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <NotesActions 
                  leadId={currentLead.id}
                  onAddNote={onAddNote}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
