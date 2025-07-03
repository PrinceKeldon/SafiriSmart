
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/types/lead';

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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    await onAddNote(leadId, newNote);
    setNewNote('');
  };

  return (
    <div className="space-y-4">
      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add a note about this lead..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()}>
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Notes History */}
      <Card>
        <CardHeader>
          <CardTitle>Notes History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Notes functionality will be implemented when backend support is added.</p>
        </CardContent>
      </Card>
    </div>
  );
};
