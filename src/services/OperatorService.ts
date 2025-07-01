
import { OperatorProfile, OperatorProfileUpdate } from '@/types/operator';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Mock storage for demo purposes - in production this would be handled by the backend
let mockOperators: any[] = [
  {
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
    role: 'operator',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

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
    const currentOperator = mockOperators[0];
    return {
      success: true,
      data: {
        id: currentOperator.id,
        name: currentOperator.name,
        email: currentOperator.email,
        company: currentOperator.company,
        role: currentOperator.role,
        specializations: currentOperator.specializations,
        is_active: currentOperator.is_active
      }
    };
  }

  async getOperatorProfile(): Promise<ApiResponse<OperatorProfile>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentOperator = mockOperators[0];
    
    return {
      success: true,
      data: currentOperator
    };
  }

  async updateOperatorProfile(profileData: OperatorProfileUpdate): Promise<ApiResponse<OperatorProfile>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the mock operator data
    const currentOperator = mockOperators[0];
    const updatedProfile = { 
      ...currentOperator, 
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    // Update the mock storage
    mockOperators[0] = updatedProfile;
    
    // Notify admin service of the update
    this.notifyAdminService(updatedProfile);

    return {
      success: true,
      data: updatedProfile
    };
  }

  private notifyAdminService(updatedOperator: any) {
    // Dispatch a custom event to notify other parts of the application
    window.dispatchEvent(new CustomEvent('operatorProfileUpdated', {
      detail: updatedOperator
    }));
  }

  // Method to get updated operator data for admin dashboard
  static getUpdatedOperators(): any[] {
    return mockOperators;
  }
}

export const operatorService = new OperatorService();
