import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

export const useLeads = (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  includeArchived?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      console.log('Fetching leads from Supabase...');
      
      let query = supabase
        .from('leads')
        .select('*')
        .not('assigned_operator_id', 'is', null) // Only show assigned/claimed leads
        .order('created_at', { ascending: false });

      // Filter out archived leads by default
      if (!params.includeArchived) {
        query = query.eq('archived', false);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.search) {
        query = query.or(`traveler_name.ilike.%${params.search}%,traveler_email.ilike.%${params.search}%`);
      }

      if (params.limit) {
        const from = ((params.page || 1) - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw new Error(`Failed to fetch leads: ${error.message}`);
      }

      console.log('Fetched leads:', data);
      return data || [];
    },
  });
};

export const useLead = (leadId: string) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      console.log('Fetching lead by ID:', leadId);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) {
        console.error('Error fetching lead:', error);
        throw new Error(`Failed to fetch lead: ${error.message}`);
      }

      return data;
    },
    enabled: !!leadId,
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      console.log('Updating lead status:', { leadId, status });
      
      const { data, error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead status:', error);
        throw new Error(`Failed to update lead status: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['archived-leads'] });
    },
  });
};

export const useUpdateLeadQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, quotedPrice, quotedCurrency }: { 
      leadId: string; 
      quotedPrice: number; 
      quotedCurrency: string; 
    }) => {
      console.log('Updating lead quote:', { leadId, quotedPrice, quotedCurrency });
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          quoted_price: quotedPrice, 
          quoted_currency: quotedCurrency,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead quote:', error);
        throw new Error(`Failed to update quote: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};
