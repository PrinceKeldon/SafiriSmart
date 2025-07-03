
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from 'sonner';

export const useNoticeBoardLeads = () => {
  return useQuery({
    queryKey: ['notice-board-leads'],
    queryFn: async () => {
      console.log('Fetching notice board leads...');
      
      // First get the lead IDs visible to current operator
      const { data: visibilityData, error: visibilityError } = await supabase
        .from('lead_visibility')
        .select('lead_id')
        .eq('operator_id', (await supabase.auth.getUser()).data.user?.id);

      if (visibilityError) {
        console.error('Error fetching lead visibility:', visibilityError);
        throw new Error(`Failed to fetch visible leads: ${visibilityError.message}`);
      }

      if (!visibilityData || visibilityData.length === 0) {
        return [];
      }

      const leadIds = visibilityData.map(v => v.lead_id);

      // Then get the actual leads that are still unclaimed
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .in('id', leadIds)
        .eq('status', 'unclaimed')
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw new Error(`Failed to fetch leads: ${leadsError.message}`);
      }

      console.log('Fetched notice board leads:', leads);
      return leads || [];
    },
  });
};

export const useClaimLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadId: string) => {
      console.log('Claiming lead:', leadId);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Default todo checklist for claimed leads
      const defaultTodoChecklist = [
        {
          id: crypto.randomUUID(),
          task: 'Initial Contact with Traveler',
          completed: false,
          created_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          task: 'Review Travel Preferences',
          completed: false,
          created_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          task: 'Prepare Custom Itinerary',
          completed: false,
          created_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          task: 'Send Quote to Traveler',
          completed: false,
          created_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          task: 'Follow Up on Quote',
          completed: false,
          created_at: new Date().toISOString()
        }
      ];

      // Update the lead to claim it
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          assigned_operator_id: user.data.user.id,
          status: 'claimed',
          todo_checklist: defaultTodoChecklist,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('status', 'unclaimed') // Ensure it's still unclaimed
        .select()
        .single();

      if (error) {
        console.error('Error claiming lead:', error);
        throw new Error(`Failed to claim lead: ${error.message}`);
      }

      // Remove from lead_visibility table
      const { error: deleteError } = await supabase
        .from('lead_visibility')
        .delete()
        .eq('lead_id', leadId);

      if (deleteError) {
        console.error('Error removing lead visibility:', deleteError);
        // Don't throw here as the claim was successful
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-board-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead claimed successfully!');
    },
    onError: (error) => {
      console.error('Error claiming lead:', error);
      toast.error(error.message || 'Failed to claim lead');
    },
  });
};
