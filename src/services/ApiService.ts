import { supabase } from '@/integrations/supabase/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  specializations: string[];
  is_active: boolean;
  created_at?: string;
}

class ApiService {
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
    // Return demo data
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

  // Mock operators data for demo
  async getOperators(): Promise<ApiResponse<Operator[]>> {
    const mockOperators: Operator[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Safari Adventures Ltd',
        role: 'operator',
        specializations: ['Safari Tours', 'Wildlife Photography'],
        is_active: true,
        created_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Mountain Expeditions',
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
    // Simulate creating operator
    const newOperator: Operator & { temporary_password?: string } = {
      id: Date.now().toString(),
      name: operatorData.name,
      email: operatorData.email,
      company: operatorData.company,
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

  // Mock leads data for demo
  async getLeads(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const mockLeads = [
      {
        id: '1',
        traveler_name: 'Alice Johnson',
        traveler_email: 'alice@example.com',
        status: 'new',
        created_at: '2024-01-15T10:00:00Z',
        preferences: { duration: 7, budget_range: 'mid-range' }
      },
      {
        id: '2',
        traveler_name: 'Bob Wilson',
        traveler_email: 'bob@example.com',
        status: 'quoted',
        created_at: '2024-01-14T15:30:00Z',
        preferences: { duration: 10, budget_range: 'luxury' }
      }
    ];

    return {
      success: true,
      data: mockLeads,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: mockLeads.length,
        total_pages: 1
      }
    };
  }

  async getLeadById(leadId: string): Promise<ApiResponse<any>> {
    const mockLead = {
      id: leadId,
      traveler_name: 'Demo Lead',
      traveler_email: 'lead@example.com',
      status: 'new',
      created_at: '2024-01-15T10:00:00Z',
      preferences: { duration: 7, budget_range: 'mid-range' },
      itinerary: null
    };

    return {
      success: true,
      data: mockLead
    };
  }

  async updateLeadStatus(leadId: string, status: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: leadId,
        status: status,
        updated_at: new Date().toISOString()
      }
    };
  }

  async addLeadNote(leadId: string, note: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        lead_id: leadId,
        note: note,
        created_at: new Date().toISOString()
      }
    };
  }

  async updateLeadQuote(leadId: string, quotedPrice: number, quotedCurrency: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: leadId,
        quoted_price: quotedPrice,
        quoted_currency: quotedCurrency,
        updated_at: new Date().toISOString()
      }
    };
  }

  async getLeadNotes(leadId: string): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          note: 'Initial contact made',
          created_at: '2024-01-15T10:00:00Z',
          operator: { name: 'Demo User' }
        }
      ]
    };
  }

  // Mock profile data
  async getOperatorProfile(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@example.com',
        company: 'Demo Safari Company',
        phone: '+1234567890',
        specializations: ['Safari Tours', 'Wildlife Photography'],
        bio: 'Experienced safari guide with over 10 years in the industry.',
        website: 'https://demosafari.com',
        location: 'Nairobi, Kenya'
      }
    };
  }

  async updateOperatorProfile(profileData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        ...profileData,
        updated_at: new Date().toISOString()
      }
    };
  }

  // Mock packages data
  async getOperatorPackages(): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Classic Safari Adventure',
          package_name: 'Classic Safari Adventure',
          description: '7-day safari experience in Maasai Mara with wildlife viewing and cultural experiences',
          duration: 7,
          min_duration: 5,
          max_duration: 10,
          price: 1500,
          estimated_cost_per_person_per_day: 215,
          currency: 'USD',
          budget_tier: 'mid-range',
          min_group_size: 2,
          max_group_size: 8,
          included_locations: [
            'Maasai Mara National Reserve',
            'Lake Nakuru',
            'Amboseli National Park'
          ],
          included_activities: [
            'Game Drives',
            'Cultural Village Visit',
            'Hot Air Balloon Safari'
          ],
          created_at: '2024-01-10T00:00:00Z'
        },
        {
          id: '2',
          name: 'Luxury Mount Kenya Trek',
          package_name: 'Luxury Mount Kenya Trek',
          description: '5-day mountain trekking adventure with luxury camping',
          duration: 5,
          min_duration: 3,
          max_duration: 7,
          price: 2200,
          estimated_cost_per_person_per_day: 440,
          currency: 'USD',
          budget_tier: 'luxury',
          min_group_size: 1,
          max_group_size: 6,
          included_locations: [
            'Mount Kenya National Park',
            'Nanyuki Town'
          ],
          included_activities: [
            'Mountain Trekking',
            'Rock Climbing',
            'Wildlife Spotting'
          ],
          created_at: '2024-01-12T00:00:00Z'
        }
      ]
    };
  }

  async createOperatorPackage(packageData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        ...packageData,
        created_at: new Date().toISOString()
      }
    };
  }

  async updateOperatorPackage(packageId: string, packageData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: packageId,
        ...packageData,
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteOperatorPackage(packageId: string): Promise<ApiResponse<void>> {
    return {
      success: true,
      data: undefined
    };
  }
}

export const apiService = new ApiService();
