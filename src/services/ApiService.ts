
import { useAuth } from '@/contexts/AuthContext';

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

class ApiService {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor() {
    // Use environment variable or fallback to localhost for development
    this.baseUrl = import.meta.env.VITE_B2B_BACKEND_URL || 'http://localhost:8001';
    this.getToken = () => localStorage.getItem('auth_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{
    access_token: string;
    token_type: string;
    expires_in: number;
    operator: {
      id: string;
      name: string;
      email: string;
      company: string;
      specializations: string[];
    };
  }>> {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentOperator(): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    company: string;
    specializations: string[];
    is_active: boolean;
  }>> {
    return this.makeRequest('/api/auth/me');
  }

  // Leads
  async getLeads(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.makeRequest(`/api/leads${queryString ? `?${queryString}` : ''}`);
  }

  async getLeadById(leadId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/leads/${leadId}`);
  }

  async updateLeadStatus(leadId: string, status: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/leads/${leadId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async addLeadNote(leadId: string, note: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async updateLeadQuote(leadId: string, quotedPrice: number, quotedCurrency: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/leads/${leadId}/quote`, {
      method: 'PUT',
      body: JSON.stringify({ 
        quoted_price: quotedPrice, 
        quoted_currency: quotedCurrency 
      }),
    });
  }

  async getLeadNotes(leadId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest(`/api/leads/${leadId}/notes`);
  }

  // Operator Profile
  async getOperatorProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/operator/profile');
  }

  async updateOperatorProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/operator/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Operator Packages
  async getOperatorPackages(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/api/operator/packages');
  }

  async createOperatorPackage(packageData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/operator/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  async updateOperatorPackage(packageId: string, packageData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/operator/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  }

  async deleteOperatorPackage(packageId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/api/operator/packages/${packageId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
