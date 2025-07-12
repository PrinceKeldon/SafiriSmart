
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadTodoItem } from '@/types/lead';
import { toast } from 'sonner';

export const useUpdateLeadTodoList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, todoChecklist }: { leadId: string; todoChecklist: LeadTodoItem[] }) => {
      console.log('🔄 Updating lead todo checklist:', { leadId, todoChecklist });
      
      // Calculate new status based on checklist completion
      let newStatus = 'claimed'; // default status
      
      // Check items in priority order (most advanced first)
      const confirmBookingTask = todoChecklist.find(item => item.id === 'task-6');
      const followUpTask = todoChecklist.find(item => item.id === 'task-5');
      const sendQuoteTask = todoChecklist.find(item => item.id === 'task-4');
      const contactEmailTask = todoChecklist.find(item => item.id === 'task-2');
      const reviewTask = todoChecklist.find(item => item.id === 'task-1');
      
      if (confirmBookingTask?.completed) {
        newStatus = 'confirmed';
      } else if (followUpTask?.completed) {
        newStatus = 'contacted';
      } else if (sendQuoteTask?.completed) {
        newStatus = 'quoted';
      } else if (contactEmailTask?.completed) {
        newStatus = 'contacted';
      } else if (reviewTask?.completed) {
        newStatus = 'claimed';
      }
      
      console.log('📊 Calculated new status based on checklist:', newStatus);
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          todo_checklist: todoChecklist as any,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating todo checklist:', error);
        throw new Error(`Failed to update todo checklist: ${error.message}`);
      }

      console.log('✅ Successfully updated checklist and status:', data);
      return data;
    },
    onSuccess: (data, { leadId }) => {
      console.log('🔄 Invalidating queries after successful update');
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Checklist updated successfully');
    },
    onError: (error) => {
      console.error('❌ Error updating todo checklist:', error);
      toast.error('Failed to update checklist');
    },
  });
};
