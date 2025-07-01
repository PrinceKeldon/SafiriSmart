import { operatorService } from './OperatorService';
import { adminService } from './AdminService';

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

class ApiService {
  // Delegate to specialized services
  getCurrentOperator = operatorService.getCurrentOperator.bind(operatorService);
  getOperators = adminService.getOperators.bind(adminService);
  createOperator = adminService.createOperator.bind(adminService);
  getOperatorProfile = operatorService.getOperatorProfile.bind(operatorService);
  updateOperatorProfile = operatorService.updateOperatorProfile.bind(operatorService);

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

  async getLeadById(leadId: string): Promise<any> {
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

  async updateLeadStatus(leadId: string, status: string): Promise<any> {
    return {
      success: true,
      data: {
        id: leadId,
        status: status,
        updated_at: new Date().toISOString()
      }
    };
  }

  async addLeadNote(leadId: string, note: string): Promise<any> {
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

  async updateLeadQuote(leadId: string, quotedPrice: number, quotedCurrency: string): Promise<any> {
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

  async getLeadNotes(leadId: string): Promise<any> {
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

  async getOperatorPackages(): Promise<any> {
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

  async createOperatorPackage(packageData: any): Promise<any> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        ...packageData,
        created_at: new Date().toISOString()
      }
    };
  }

  async updateOperatorPackage(packageId: string, packageData: any): Promise<any> {
    return {
      success: true,
      data: {
        id: packageId,
        ...packageData,
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteOperatorPackage(packageId: string): Promise<any> {
    return {
      success: true,
      data: undefined
    };
  }
}

export const apiService = new ApiService();
