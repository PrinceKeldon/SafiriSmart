
class B2CApiService {
  private b2bBackendUrl: string;
  private aiCoreUrl: string;

  constructor() {
    // Use environment variables or fallback to localhost for development
    this.b2bBackendUrl = import.meta.env.VITE_B2B_BACKEND_URL || 'http://localhost:8001';
    this.aiCoreUrl = import.meta.env.VITE_AI_CORE_SERVICE_URL || 'http://localhost:8000';
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // AI Core Service - Generate Itinerary
  async generateItinerary(preferences: {
    duration: number;
    budgetRange: string;
    interests: string[];
    groupSize: number;
    travelPace: string;
  }): Promise<any> {
    return this.makeRequest(`${this.aiCoreUrl}/generate_itinerary`, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  // B2B Backend - Create Lead
  async createLead(leadData: {
    traveler: {
      name: string;
      email: string;
      phone?: string;
      country?: string;
    };
    preferences: {
      duration: number;
      budgetRange: string;
      interests: string[];
      groupSize: number;
      travelPace: string;
      languages: string[];
    };
    schedule?: {
      startDate?: Date;
      endDate?: Date;
      flexible: boolean;
    };
    travel?: {
      portOfEntry?: string;
      airportPickup: boolean;
      pickupTime?: string;
      pickupLocation?: string;
    };
    dietary?: {
      mealWishes?: string;
      allergies?: string;
      specialRequirements?: string;
    };
    itinerary?: any;
  }): Promise<any> {
    return this.makeRequest(`${this.b2bBackendUrl}/api/leads`, {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  // Health check endpoints
  async checkB2BBackendHealth(): Promise<any> {
    try {
      return await this.makeRequest(`${this.b2bBackendUrl}/health`);
    } catch (error) {
      console.error('B2B Backend health check failed:', error);
      throw error;
    }
  }

  async checkAICoreHealth(): Promise<any> {
    try {
      return await this.makeRequest(`${this.aiCoreUrl}/health`);
    } catch (error) {
      console.error('AI Core Service health check failed:', error);
      throw error;
    }
  }
}

export const b2cApiService = new B2CApiService();
