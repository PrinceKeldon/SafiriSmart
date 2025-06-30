
class AiService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or fallback to localhost for development
    this.baseUrl = import.meta.env.VITE_AI_CORE_SERVICE_URL || 'http://localhost:8000';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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

  async generateItinerary(preferences: {
    duration: number;
    budgetRange: string;
    interests: string[];
    groupSize: number;
    travelPace: string;
  }): Promise<any> {
    return this.makeRequest('/generate_itinerary', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async createLead(leadData: {
    traveler: {
      name: string;
      email: string;
      phone: string;
      country: string;
    };
    preferences: any;
    itinerary?: any;
  }): Promise<any> {
    return this.makeRequest('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }
}

export const aiService = new AiService();
