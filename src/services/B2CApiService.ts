
import { supabase } from '@/integrations/supabase/client';

class B2CApiService {
  // AI Core Service - Generate Itinerary (if needed in future)
  async generateItinerary(preferences: {
    duration: number;
    budgetRange: string;
    interests: string[];
    groupSize: number;
    travelPace: string;
  }): Promise<any> {
    // This would call AI service in the future
    throw new Error('AI Core Service not implemented yet');
  }

  // Create Lead via Supabase Edge Function
  async createLead(leadData: {
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
  }): Promise<any> {
    console.log('B2CApiService: Creating lead via Supabase Edge Function:', {
      travelerInfo: leadData.traveler,
      hasItinerary: !!leadData.itinerary
    });

    try {
      const { data, error } = await supabase.functions.invoke('create-lead', {
        body: leadData
      });

      if (error) {
        console.error('B2CApiService: Edge function error:', error);
        throw new Error(error.message || 'Failed to create lead');
      }

      console.log('B2CApiService: Lead created successfully:', data);
      return data;
    } catch (error) {
      console.error('B2CApiService: Error calling edge function:', error);
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
