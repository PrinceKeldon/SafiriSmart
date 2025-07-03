
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Create lead function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    const { traveler, preferences, schedule, travel, dietary } = requestBody;

    // Validate required fields
    if (!traveler?.name || !traveler?.email) {
      throw new Error('Traveler name and email are required');
    }

    if (!preferences) {
      throw new Error('Preferences are required');
    }

    // Process dates properly
    const processedSchedule = schedule ? {
      startDate: schedule.startDate ? new Date(schedule.startDate).toISOString() : null,
      endDate: schedule.endDate ? new Date(schedule.endDate).toISOString() : null,
      flexible: schedule.flexible || true
    } : {
      startDate: null,
      endDate: null,
      flexible: true
    };

    // Enhanced mock itinerary with new features including languages
    const mockItinerary = {
      id: crypto.randomUUID(),
      title: `${preferences.duration}-Day Safari Adventure`,
      overview: `A comprehensive ${preferences.duration}-day safari experience tailored for ${preferences.groupSize} travelers with personalized logistics, dietary considerations, and ${preferences.languages ? preferences.languages.join(', ') : 'English'} speaking guide`,
      totalDuration: preferences.duration,
      estimatedCost: {
        amount: preferences.budgetRange === 'budget' ? 2000 : preferences.budgetRange === 'mid-range' ? 4000 : 8000,
        currency: 'USD',
        breakdown: {
          accommodation: 0.4,
          transport: 0.2,
          activities: 0.3,
          meals: 0.1,
          other: 0.0
        }
      },
      schedule: processedSchedule,
      travel: {
        portOfEntry: travel?.portOfEntry || 'TBD',
        airportPickup: travel?.airportPickup || false,
        pickupDetails: travel?.airportPickup ? {
          time: travel?.pickupTime || 'TBD',
          location: travel?.pickupLocation || 'TBD'
        } : null
      },
      dietary: {
        mealWishes: dietary?.mealWishes || null,
        allergies: dietary?.allergies || null,
        specialRequirements: dietary?.specialRequirements || null
      },
      languages: preferences?.languages || ['English'],
      days: Array.from({ length: preferences.duration }, (_, i) => ({
        day: i + 1,
        location: i === 0 ? (travel?.portOfEntry || 'Safari Location') : 'Safari Location',
        accommodation: {
          name: 'Safari Lodge',
          type: preferences.budgetRange,
          rating: 4.5
        },
        activities: [{
          name: i === 0 ? 'Arrival & Transfer' : 'Game Drive',
          duration: i === 0 ? '2-3 hours' : '3-4 hours',
          description: i === 0 ? 'Airport pickup and transfer to lodge' : 'Wildlife viewing experience',
          cost: i === 0 ? 50 : 150,
          type: 'safari'
        }],
        meals: dietary?.mealWishes ? 
          ['Breakfast (Dietary accommodated)', 'Lunch (Dietary accommodated)', 'Dinner (Dietary accommodated)'] :
          ['Breakfast', 'Lunch', 'Dinner'],
        transport: 'Safari Vehicle',
        notes: i === 0 && travel?.airportPickup ? 
          `Airport pickup scheduled at ${travel.pickupTime || 'TBD'} from ${travel.pickupLocation || 'TBD'}. Guide speaks ${preferences.languages ? preferences.languages.join(', ') : 'English'}` :
          `Guide speaks ${preferences.languages ? preferences.languages.join(', ') : 'English'}`,
        pickup_details: i === 0 && travel?.airportPickup ? {
          time: travel.pickupTime || 'TBD',
          location: travel.pickupLocation || 'TBD'
        } : null,
        travel_notes: i === 0 ? `Entry point: ${travel?.portOfEntry || 'TBD'}` : null
      }))
    };

    // Create enhanced preferences object including languages
    const enhancedPreferences = {
      ...preferences,
      schedule: processedSchedule,
      travel,
      dietary,
      languages: preferences.languages || ['English']
    };

    console.log('Inserting lead into database...');

    // Insert the lead into Supabase with status 'unclaimed' and no assigned operator
    const { data: leadData, error } = await supabaseClient
      .from('leads')
      .insert({
        traveler_name: traveler.name,
        traveler_email: traveler.email,
        traveler_phone: traveler.phone || null,
        traveler_country: traveler.country || null,
        preferences: enhancedPreferences,
        itinerary: mockItinerary,
        status: 'unclaimed',
        assigned_operator_id: null,
        todo_checklist: []
      })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    console.log('Lead created successfully:', leadData);

    // Now perform intelligent matching to find best operators
    console.log('Starting intelligent operator matching...');
    
    const { data: operators, error: operatorsError } = await supabaseClient
      .from('operators')
      .select('id, services_offered, destinations_covered')
      .eq('is_active', true);

    if (operatorsError) {
      console.error('Error fetching operators:', operatorsError);
      // Don't fail the whole request, just log the error
    } else if (operators && operators.length > 0) {
      // Intelligent matching algorithm
      const interests = enhancedPreferences.interests || [];
      const destinations = extractDestinationsFromItinerary(mockItinerary);
      
      console.log('Matching criteria:', { interests, destinations });
      
      const operatorScores = operators.map(operator => {
        let score = 0;
        const services = operator.services_offered || [];
        const covered_destinations = operator.destinations_covered || [];
        
        // Score based on matching interests with services
        for (const interest of interests) {
          for (const service of services) {
            if (interest.toLowerCase().includes(service.toLowerCase()) || 
                service.toLowerCase().includes(interest.toLowerCase())) {
              score += 2;
            }
          }
        }
        
        // Score based on matching destinations
        for (const destination of destinations) {
          for (const covered of covered_destinations) {
            if (destination.toLowerCase().includes(covered.toLowerCase()) || 
                covered.toLowerCase().includes(destination.toLowerCase())) {
              score += 3;
            }
          }
        }
        
        return { operator_id: operator.id, score };
      });

      // Sort by score and take top 3-5 operators
      const topOperators = operatorScores
        .filter(op => op.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(op => op.operator_id);

      console.log('Top matched operators:', topOperators);

      // If no operators scored, fall back to first few active operators
      const selectedOperators = topOperators.length > 0 
        ? topOperators 
        : operators.slice(0, 3).map(op => op.id);

      // Insert into lead_visibility table
      if (selectedOperators.length > 0) {
        const visibilityEntries = selectedOperators.map(operatorId => ({
          lead_id: leadData.id,
          operator_id: operatorId
        }));

        const { error: visibilityError } = await supabaseClient
          .from('lead_visibility')
          .insert(visibilityEntries);

        if (visibilityError) {
          console.error('Error creating lead visibility entries:', visibilityError);
          // Don't fail the whole request
        } else {
          console.log(`Lead visibility created for ${selectedOperators.length} operators`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lead_id: leadData.id,
          status: leadData.status,
          assigned_operator: null
        },
        message: 'Lead created successfully and matched to operators'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating lead:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create lead'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to extract destinations from itinerary
function extractDestinationsFromItinerary(itinerary: any): string[] {
  const destinations: string[] = [];
  
  if (itinerary?.days) {
    for (const day of itinerary.days) {
      if (day.location && !destinations.includes(day.location)) {
        destinations.push(day.location);
      }
      if (day.activities) {
        for (const activity of day.activities) {
          if (activity.location && !destinations.includes(activity.location)) {
            destinations.push(activity.location);
          }
        }
      }
    }
  }
  
  return destinations;
}
