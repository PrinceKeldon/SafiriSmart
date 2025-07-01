
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  company_name: string;
  registration_number: string;
  address: string;
  city: string;
  country: string;
  contact_person_name: string;
  contact_person_phone: string;
  website_url: string;
  description: string;
  certificate_of_incorporation_url: string;
  business_permit_url: string;
  kato_membership_url: string;
  role: string;
  specializations: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

class AdminService {
  async getOperators(): Promise<ApiResponse<Operator[]>> {
    // Get updated operators from OperatorService
    const { OperatorService } = await import('./OperatorService');
    const updatedOperators = OperatorService.getUpdatedOperators();
    
    const mockOperators: Operator[] = [
      // Use the updated operator data
      ...updatedOperators.map(op => ({
        id: op.id,
        name: op.name,
        email: op.email,
        company: op.company,
        company_name: op.company_name || '',
        registration_number: op.registration_number || '',
        address: op.address || '',
        city: op.city || '',
        country: op.country || 'Kenya',
        contact_person_name: op.contact_person_name || '',
        contact_person_phone: op.contact_person_phone || '',
        website_url: op.website_url || '',
        description: op.description || '',
        certificate_of_incorporation_url: op.certificate_of_incorporation_url || '',
        business_permit_url: op.business_permit_url || '',
        kato_membership_url: op.kato_membership_url || '',
        role: op.role,
        specializations: op.specializations || [],
        is_active: op.is_active,
        created_at: op.created_at?.split('T')[0] || '2024-01-15',
        updated_at: op.updated_at
      })),
      // Additional mock operators
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Mountain Expeditions',
        company_name: 'Mountain Expeditions Kenya Ltd',
        registration_number: 'REG-002-2024',
        address: '456 Mountain View Road',
        city: 'Nakuru',
        country: 'Kenya',
        contact_person_name: 'Jane Smith',
        contact_person_phone: '+254-700-789012',
        website_url: 'https://mountainexpeditions.com',
        description: 'Expert mountain trekking and adventure tourism company with over 10 years of experience.',
        certificate_of_incorporation_url: 'https://example.com/cert2.pdf',
        business_permit_url: 'https://example.com/permit2.pdf',
        kato_membership_url: 'https://example.com/kato2.pdf',
        role: 'operator',
        specializations: ['Mountain Climbing', 'Trekking'],
        is_active: true,
        created_at: '2024-01-20'
      }
    ];

    return {
      success: true,
      data: mockOperators
    };
  }

  async createOperator(operatorData: {
    name: string;
    email: string;
    company: string;
    specializations?: string[];
  }): Promise<ApiResponse<Operator & { temporary_password?: string }>> {
    const newOperator: Operator & { temporary_password?: string } = {
      id: Date.now().toString(),
      name: operatorData.name,
      email: operatorData.email,
      company: operatorData.company,
      company_name: '',
      registration_number: '',
      address: '',
      city: '',
      country: 'Kenya',
      contact_person_name: '',
      contact_person_phone: '',
      website_url: '',
      description: '',
      certificate_of_incorporation_url: '',
      business_permit_url: '',
      kato_membership_url: '',
      specializations: operatorData.specializations || [],
      role: 'operator',
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
      temporary_password: 'demo123'
    };

    return {
      success: true,
      data: newOperator
    };
  }
}

export const adminService = new AdminService();
