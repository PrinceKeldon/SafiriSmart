
import { OperatorProfile, OperatorProfileUpdate } from '@/types/operator';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

class OperatorService {
  // Mock current operator for demo purposes
  async getCurrentOperator(): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    company: string;
    role: string;
    specializations: string[];
    is_active: boolean;
  }>> {
    return {
      success: true,
      data: {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@example.com',
        company: 'Demo Safari Company',
        role: 'operator',
        specializations: ['Safari Tours', 'Wildlife Photography'],
        is_active: true
      }
    };
  }

  async getOperatorProfile(): Promise<ApiResponse<OperatorProfile>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockProfile: OperatorProfile = {
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

    return {
      success: true,
      data: mockProfile
    };
  }

  async updateOperatorProfile(profileData: OperatorProfileUpdate): Promise<ApiResponse<OperatorProfile>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentProfile = await this.getOperatorProfile();
    const updatedProfile = { 
      ...currentProfile.data, 
      ...profileData,
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      data: updatedProfile
    };
  }
}

export const operatorService = new OperatorService();
