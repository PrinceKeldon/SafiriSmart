
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLeadNotes, useAddLeadNote } from '@/hooks/useLeadNotes';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesActionsProps {
  leadId: string;
  onAddNote: (leadId: string, note: string) => void;
  isAddingNote?: boolean;
}

export const NotesActions = ({ 
  leadId, 
  onAddNote, 
  isAddingNote = false 
}: NotesActionsProps) => {
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();
  
  // Use our custom hooks for notes
  const { data: notes = [], isLoading: isLoadingNotes, error: notesError } = useLeadNotes(leadId);
  const addNoteMutation = useAddLeadNote();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addNoteMutation.mutateAsync({ leadId, note: newNote.trim() });
      
      // Also call the parent callback for compatibility
      onAddNote(leadId, newNote.trim());
      
      setNewNote('');
      toast({
        title: "Note Added",
        description: "Your note has been successfully added to this lead.",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add a note about this lead..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleAddNote} 
            disabled={addNoteMutation.isPending || !newNote.trim()}
            className="w-full"
          >
            {addNoteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Note...
              </>
            ) : (
              'Add Note'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notes History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes History ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingNotes ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading notes...</span>
            </div>
          ) : notesError ? (
            <div className="text-red-500 p-4 text-center">
              Error loading notes: {notesError.message}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No notes yet. Add the first note above.
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {note.operator_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{note.note}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
