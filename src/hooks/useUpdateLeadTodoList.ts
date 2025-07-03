
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadTodoItem } from '@/types/lead';
import { toast } from 'sonner';

export const useUpdateLeadTodoList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, todoChecklist }: { leadId: string; todoChecklist: LeadTodoItem[] }) => {
      console.log('Updating lead todo checklist:', { leadId, todoChecklist });
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          todo_checklist: todoChecklist,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        console.error('Error updating todo checklist:', error);
        throw new Error(`Failed to update todo checklist: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      console.error('Error updating todo checklist:', error);
      toast.error('Failed to update checklist');
    },
  });
};
