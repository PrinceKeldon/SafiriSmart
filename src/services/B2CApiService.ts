
import { supabase } from '@/integrations/supabase/client';

class B2CApiService {
  // Get all active operators for selection
  async getPublicOperators(): Promise<any[]> {
    console.log('B2CApiService: Fetching public operators...');
    
    try {
      const { data, error } = await supabase.functions.invoke('get-public-operators');
      
      if (error) {
        console.error('B2CApiService: Error fetching operators:', error);
        throw new Error(error.message || 'Failed to fetch operators');
      }
      
      console.log('B2CApiService: Operators fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('B2CApiService: Error calling get-public-operators function:', error);
      throw error;
    }
  }

  // Create Lead with selected operators
  async createLeadWithSelectedOperators(leadData: {
    traveler: {
      name: string;
      email: string;
      phone?: string;
      country: string;
      message?: string;
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
    selectedOperatorIds: string[];
  }): Promise<any> {
    console.log('B2CApiService: Creating lead with selected operators:', {
      travelerInfo: leadData.traveler,
      selectedOperators: leadData.selectedOperatorIds.length,
      hasItinerary: !!leadData.itinerary
    });

    try {
      const { data, error } = await supabase.functions.invoke('create-lead-with-operators', {
        body: {
          ...leadData,
          selected_operator_ids: leadData.selectedOperatorIds
        }
      });

      if (error) {
        console.error('B2CApiService: Edge function error:', error);
        throw new Error(error.message || 'Failed to create lead');
      }

      console.log('B2CApiService: Lead created successfully:', data);
      return data;
    } catch (error) {
      console.error('B2CApiService: Error calling create-lead-with-operators function:', error);
      throw error;
    }
  }

  // Health check endpoints (for future use)
  async checkB2BBackendHealth(): Promise<any> {
    throw new Error('B2B Backend health check not implemented');
  }

  async checkAICoreHealth(): Promise<any> {
    throw new Error('AI Core Service health check not implemented');
  }
}

export const b2cApiService = new B2CApiService();
