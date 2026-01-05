import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadTodoItem, Lead } from '@/types/lead';
import { toast } from 'sonner';

// Helper to extract itinerary summary for completed leads
const extractItinerarySummary = (itinerary: any) => {
  if (!itinerary) return null;
  return {
    title: itinerary.title || itinerary.tour_name,
    duration: itinerary.duration,
    highlights: itinerary.highlights?.slice(0, 5),
    total_days: itinerary.days?.length || itinerary.itinerary_details?.length
  };
};

// Helper to record completed lead
const recordCompletedLead = async (lead: Lead) => {
  try {
    const itinerarySummary = extractItinerarySummary(lead.itinerary);
    const destinations = lead.preferences?.destinations || [];
    
    const { error } = await (supabase as any)
      .from('completed_leads')
      .upsert({
        original_lead_id: lead.id,
        operator_id: lead.assigned_operator_id,
        traveler_name: lead.traveler_name,
        traveler_email: lead.traveler_email,
        traveler_phone: lead.traveler_phone,
        traveler_country: lead.traveler_country,
        itinerary_summary: itinerarySummary,
        destinations: destinations,
        travel_dates: lead.preferences?.travel_dates || lead.preferences?.schedule,
        group_size: lead.preferences?.group_size || lead.preferences?.groupSize,
        quoted_price: lead.quoted_price,
        quoted_currency: lead.quoted_currency
      }, { onConflict: 'original_lead_id' });
    
    if (error) {
      // Silently handle if table doesn't exist yet
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('completed_leads table not yet created, skipping recording');
        return false;
      }
      console.error('Error recording completed lead:', error);
      return false;
    }
    
    console.log('✅ Successfully recorded completed lead');
    return true;
  } catch (err) {
    console.error('Error in recordCompletedLead:', err);
    return false;
  }
};

export const useUpdateLeadTodoList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, todoChecklist }: { leadId: string; todoChecklist: LeadTodoItem[] }) => {
      console.log('🔄 Updating lead todo checklist:', { leadId, todoChecklist });
      
      // Check if all tasks are completed
      const allTasksCompleted = todoChecklist.every(item => item.completed);
      
      // Calculate new status based on checklist completion
      let newStatus = 'claimed'; // default status
      
      if (allTasksCompleted) {
        // All tasks complete = lead is converted/completed
        newStatus = 'completed';
      } else {
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
      
      // Convert the Supabase response to our Lead type
      const updatedLead: Lead = {
        id: data.id,
        status: data.status as Lead['status'],
        assigned_operator_id: data.assigned_operator_id,
        traveler_name: data.traveler_name,
        traveler_email: data.traveler_email,
        traveler_phone: data.traveler_phone,
        traveler_country: data.traveler_country,
        preferences: data.preferences as any,
        itinerary: data.itinerary as any,
        quoted_price: data.quoted_price,
        quoted_currency: data.quoted_currency,
        todo_checklist: data.todo_checklist as unknown as LeadTodoItem[],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      // If all tasks completed, record to completed_leads table
      if (allTasksCompleted) {
        const recorded = await recordCompletedLead(updatedLead);
        if (recorded) {
          console.log('🎉 Lead conversion recorded in completed_leads table');
        }
      }
      
      return updatedLead;
    },
    onSuccess: (data, { leadId }) => {
      console.log('🔄 Invalidating queries after successful update');
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['completed-leads'] });
      
      // Show special message if lead was completed
      if (data.status === 'completed') {
        toast.success('🎉 Lead converted and recorded!');
      } else {
        toast.success('Checklist updated successfully');
      }
    },
    onError: (error) => {
      console.error('❌ Error updating todo checklist:', error);
      toast.error('Failed to update checklist');
    },
  });
};
