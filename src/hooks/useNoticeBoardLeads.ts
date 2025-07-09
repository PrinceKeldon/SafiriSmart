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

      // First, let's check what's in the lead_visibility table for this user
      const { data: visibilityCheck, error: visibilityCheckError } = await supabase
        .from('lead_visibility')
        .select('*')
        .eq('operator_id', user.id);

      console.log('🔍 Lead visibility entries for user:', visibilityCheck);
      if (visibilityCheckError) {
        console.error('❌ Error checking lead visibility:', visibilityCheckError);
      }

      // Also check all unclaimed leads in the system (for debugging)
      const { data: allUnclaimedLeads, error: allLeadsError } = await supabase
        .from('leads')
        .select('id, status, traveler_name, created_at')
        .eq('status', 'unclaimed')
        .order('created_at', { ascending: false });

      console.log('📋 All unclaimed leads in system:', allUnclaimedLeads);
      if (allLeadsError) {
        console.error('❌ Error fetching all unclaimed leads:', allLeadsError);
      }

      // Use a more direct query that joins lead_visibility with leads
      console.log('🔍 Attempting direct join query...');
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          lead_visibility!inner(operator_id)
        `)
        .eq('lead_visibility.operator_id', user.id)
        .eq('status', 'unclaimed')
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('❌ Error fetching leads with visibility:', leadsError);
        
        // Fallback: try the original two-step approach
        console.log('🔄 Trying fallback approach...');
        
        const { data: visibilityData, error: visibilityError } = await supabase
          .from('lead_visibility')
          .select('lead_id')
          .eq('operator_id', user.id);

        if (visibilityError) {
          console.error('❌ Error fetching lead visibility:', visibilityError);
          throw new Error(`Failed to fetch visible leads: ${visibilityError.message}`);
        }

        console.log('👁️ Visibility data:', visibilityData);

        if (!visibilityData || visibilityData.length === 0) {
          console.log('⚠️ No visible leads found for operator');
          return [];
        }

        const leadIds = visibilityData.map(v => v.lead_id);
        console.log('🎯 Lead IDs to fetch:', leadIds);

        // Fetch leads directly
        const { data: fallbackLeads, error: fallbackError } = await supabase
          .from('leads')
          .select('*')
          .in('id', leadIds)
          .eq('status', 'unclaimed')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('❌ Fallback query failed:', fallbackError);
          throw new Error(`Failed to fetch leads: ${fallbackError.message}`);
        }

        console.log('✅ Fallback leads found:', fallbackLeads?.length || 0, 'leads');
        console.log('📋 Fallback leads details:', fallbackLeads);
        return fallbackLeads || [];
      }

      console.log('✅ Direct query leads found:', leads?.length || 0, 'leads');
      console.log('📋 Direct query leads details:', leads);
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
