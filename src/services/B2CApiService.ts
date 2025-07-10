
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

  // Generate itinerary (placeholder for AI service integration)
  async generateItinerary(preferences: {
    duration: number;
    budgetRange: string;
    interests: string[];
    groupSize: number;
    travelPace: string;
  }): Promise<any> {
    console.log('B2CApiService: Generating itinerary with preferences:', preferences);
    
    // For now, return a mock response since we don't have AI service integrated
    return {
      tour_name: `${preferences.duration}-Day Kenya Safari Adventure`,
      summary: `Experience the best of Kenya's wildlife and landscapes with this carefully crafted ${preferences.duration}-day safari.`,
      itinerary_details: Array.from({ length: preferences.duration }, (_, i) => ({
        day_number: i + 1,
        theme: i === 0 ? 'Arrival & Masai Mara' : `Safari Day ${i + 1}`,
        location: i === 0 ? 'Nairobi to Masai Mara' : 'Masai Mara National Reserve',
        activities: ['Game Drive', 'Wildlife Photography'],
        accommodation_suggestion: 'Safari Lodge',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      })),
      inclusions_suggestions: [
        'All park entrance fees',
        'Professional safari guide',
        'Transportation in 4WD vehicle'
      ],
      exclusions_suggestions: [
        'International flights',
        'Personal expenses',
        'Travel insurance'
      ],
      important_notes: [
        'Best time to travel is during dry seasons',
        'Comfortable walking shoes recommended'
      ]
    };
  }

  // Create lead (legacy method for compatibility)
  async createLead(leadData: {
    traveler: {
      name: string;
      email: string;
      phone?: string;
      country: string;
      message?: string;
    };
    preferences: any;
    schedule?: any;
    travel?: any;
    dietary?: any;
    itinerary?: any;
  }): Promise<any> {
    console.log('B2CApiService: Creating lead (legacy method):', leadData);
    
    // For legacy compatibility, create lead without operator selection
    // This would typically go to all operators or a default matching system
    throw new Error('Legacy createLead method deprecated. Use createLeadWithSelectedOperators instead.');
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
