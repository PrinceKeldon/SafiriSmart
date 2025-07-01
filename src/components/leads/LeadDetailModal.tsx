
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/types/api';
import { ItineraryEditor } from './ItineraryEditor';
import { LeadOverview } from './LeadOverview';
import { ItineraryView } from './ItineraryView';
import { NotesActions } from './NotesActions';
import { toast } from 'sonner';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onAddNote: (leadId: string, note: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateItinerary?: (leadId: string, itinerary: any) => void;
  onSendItinerary?: (leadId: string) => void;
}

export const LeadDetailModal = ({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
  onDeleteLead,
  onUpdateItinerary,
  onSendItinerary
}: LeadDetailModalProps) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditingItinerary, setIsEditingItinerary] = useState(false);
  const [isUpdatingItinerary, setIsUpdatingItinerary] = useState(false);
  const [isSendingItinerary, setIsSendingItinerary] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  if (!lead) return null;

  const handleAddNote = async (leadId: string, note: string) => {
    setIsAddingNote(true);
    try {
      await onAddNote(leadId, note);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUpdateItinerary = async (updatedItinerary: any) => {
    setIsUpdatingItinerary(true);
    try {
      await onUpdateItinerary?.(lead.id, updatedItinerary);
      setIsEditingItinerary(false);
      toast.success('Itinerary updated successfully');
    } catch (error) {
      toast.error('Failed to update itinerary');
    } finally {
      setIsUpdatingItinerary(false);
    }
  };

  const handleSendItinerary = async () => {
    setIsSendingItinerary(true);
    try {
      await onSendItinerary?.(lead.id);
      toast.success('Itinerary sent successfully');
    } catch (error) {
      toast.error('Failed to send itinerary');
    } finally {
      setIsSendingItinerary(false);
    }
  };

  const handleDeleteLead = async () => {
    setIsDeletingLead(true);
    try {
      await onDeleteLead?.(lead.id);
      onClose();
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
    } finally {
      setIsDeletingLead(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Lead Details - {lead.traveler_name}</span>
              <div className="flex items-center space-x-2">
                <Badge className={`${
                  lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                  lead.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                  lead.status === 'booked' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
                
                {/* Delete Lead Button */}
                {onDeleteLead && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this lead? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteLead}
                          disabled={isDeletingLead}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeletingLead ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="notes">Notes & Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <LeadOverview lead={lead} />
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-4">
              <ItineraryView
                lead={lead}
                onEditItinerary={() => setIsEditingItinerary(true)}
                onSendItinerary={handleSendItinerary}
                isSendingItinerary={isSendingItinerary}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <NotesActions
                lead={lead}
                onUpdateStatus={onUpdateStatus}
                onAddNote={handleAddNote}
                isAddingNote={isAddingNote}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Itinerary Editor Modal */}
      {onUpdateItinerary && (
        <ItineraryEditor
          itinerary={lead.itinerary}
          isOpen={isEditingItinerary}
          onClose={() => setIsEditingItinerary(false)}
          onSave={handleUpdateItinerary}
          isLoading={isUpdatingItinerary}
        />
      )}
    </>
  );
};
