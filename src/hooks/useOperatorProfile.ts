
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorProfile, OperatorProfileUpdate } from '@/types/operator';

// Mock API calls - replace with real API calls when backend is ready
const mockOperatorProfile: OperatorProfile = {
  id: 'demo-operator-1',
  name: 'Demo Operator',
  email: 'demo@example.com',
  company: 'Demo Safari Company',
  company_name: 'Demo Safari Company Ltd',
  registration_number: 'REG-123456',
  address: '123 Safari Street, Wildlife District',
  city: 'Nairobi',
  country: 'Kenya',
  contact_person_name: 'John Safari',
  contact_person_phone: '+254-700-123456',
  website_url: 'https://demosafari.com',
  description: 'Leading safari operator in Kenya with over 15 years of experience providing unforgettable wildlife adventures.',
  certificate_of_incorporation_url: '',
  business_permit_url: '',
  kato_membership_url: '',
  specializations: ['Safari Tours', 'Wildlife Photography', 'Cultural Tours'],
  is_active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

export const useOperatorProfile = () => {
  return useQuery({
    queryKey: ['operator-profile'],
    queryFn: async (): Promise<OperatorProfile> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, return mock data
      // In production, this would be:
      // const response = await apiService.getOperatorProfile();
      // return response.data;
      
      return mockOperatorProfile;
    },
  });
};

export const useUpdateOperatorProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: OperatorProfileUpdate): Promise<OperatorProfile> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, merge with existing data
      // In production, this would be:
      // const response = await apiService.updateOperatorProfile(data);
      // return response.data;
      
      const updatedProfile = { ...mockOperatorProfile, ...data };
      return updatedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-profile'] });
    },
  });
};
