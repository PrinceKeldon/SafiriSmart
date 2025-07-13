
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  created_by: string;
  created_at: string;
  operator_name?: string;
}

export const useLeadNotes = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      console.log('Fetching notes for lead:', leadId);
      
      const { data, error } = await supabase
        .from('lead_notes')
        .select(`
          *,
          created_by_operator:operators(name)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead notes:', error);
        throw new Error(`Failed to fetch notes: ${error.message}`);
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(note => ({
        id: note.id,
        lead_id: note.lead_id,
        note: note.note,
        created_by: note.created_by,
        created_at: note.created_at,
        operator_name: note.created_by_operator?.name || 'Unknown'
      }));

      console.log('Fetched notes:', transformedData);
      return transformedData;
    },
    enabled: !!leadId,
  });
};

export const useAddLeadNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: string }) => {
      console.log('Adding note to lead:', { leadId, note });
      
      // Get current operator ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          note: note,
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          created_by_operator:operators(name)
        `)
        .single();

      if (error) {
        console.error('Error adding lead note:', error);
        throw new Error(`Failed to add note: ${error.message}`);
      }

      // Transform the response to match our interface
      return {
        id: data.id,
        lead_id: data.lead_id,
        note: data.note,
        created_by: data.created_by,
        created_at: data.created_at,
        operator_name: data.created_by_operator?.name || 'Unknown'
      };
    },
    onSuccess: (_, { leadId }) => {
      // Invalidate and refetch notes for this lead
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
    },
  });
};
