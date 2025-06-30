
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';

export const useLeads = (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const response = await apiService.getLeads(params);
      if (!response.success) {
        throw new Error('Failed to fetch leads');
      }
      return response;
    },
  });
};

export const useLead = (leadId: string) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const response = await apiService.getLeadById(leadId);
      if (!response.success) {
        throw new Error('Failed to fetch lead');
      }
      return response.data;
    },
    enabled: !!leadId,
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const response = await apiService.updateLeadStatus(leadId, status);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update lead status');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useAddLeadNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: string }) => {
      const response = await apiService.addLeadNote(leadId, note);
      if (!response.success) {
        throw new Error(response.message || 'Failed to add note');
      }
      return response.data;
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
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
      const response = await apiService.updateLeadQuote(leadId, quotedPrice, quotedCurrency);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update quote');
      }
      return response.data;
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useLeadNotes = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const response = await apiService.getLeadNotes(leadId);
      if (!response.success) {
        throw new Error('Failed to fetch lead notes');
      }
      return response.data;
    },
    enabled: !!leadId,
  });
};
