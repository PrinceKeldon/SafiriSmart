
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from 'sonner';

export const useNoticeBoardLeads = () => {
  return useQuery({
    queryKey: ['notice-board-leads'],
    queryFn: async () => {
      console.log('🔍 useNoticeBoardLeads: Starting fetch...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ Error getting user:', userError);
        throw new Error('User not authenticated');
      }

      console.log('👤 Current user ID:', user.id);

      // First, get lead visibility entries for this user
      const { data: visibilityData, error: visibilityError } = await supabase
        .from('lead_visibility')
        .select('lead_id')
        .eq('operator_id', user.id);

      console.log('👁️ Raw visibility data:', visibilityData);
      console.log('❌ Visibility error:', visibilityError);

      if (visibilityError) {
        console.error('❌ Error fetching lead visibility:', visibilityError);
        throw new Error(`Failed to fetch visible leads: ${visibilityError.message}`);
      }

      if (!visibilityData || visibilityData.length === 0) {
        console.log('⚠️ No visible leads found for operator');
        return [];
      }

      const leadIds = visibilityData.map(v => v.lead_id);
      console.log('🎯 Lead IDs to fetch:', leadIds);

      // Now fetch leads with these IDs that are unclaimed
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .in('id', leadIds)
        .eq('status', 'unclaimed')
        .order('created_at', { ascending: false });

      console.log('📊 Direct leads query result:', leads);
      console.log('❌ Direct leads error:', leadsError);

      if (leadsError) {
        console.error('❌ Error fetching leads:', leadsError);
        throw new Error(`Failed to fetch leads: ${leadsError.message}`);
      }

      // Additional debugging: check what leads exist with any status
      const { data: allStatusLeads, error: allStatusError } = await supabase
        .from('leads')
        .select('id, status, traveler_name, created_at')
        .in('id', leadIds)
        .order('created_at', { ascending: false });

      console.log('🔍 All leads with any status for this operator:', allStatusLeads);
      if (allStatusError) {
        console.error('❌ Error fetching all status leads:', allStatusError);
      }

      // Log the specific filtering results
      const unclaimedCount = allStatusLeads?.filter(l => l.status === 'unclaimed').length || 0;
      const claimedCount = allStatusLeads?.filter(l => l.status === 'claimed').length || 0;
      const otherStatusCount = allStatusLeads?.filter(l => l.status !== 'unclaimed' && l.status !== 'claimed').length || 0;

      console.log(`📈 Lead status breakdown: ${unclaimedCount} unclaimed, ${claimedCount} claimed, ${otherStatusCount} other`);

      return leads || [];
    },
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
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
