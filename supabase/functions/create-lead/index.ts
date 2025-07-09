
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
    console.log('Create lead function called - simplified routing to all operators');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    const { traveler, preferences, schedule, travel, dietary } = requestBody;

    // Enhanced validation for required enquirer fields
    if (!traveler?.name || !traveler?.email || !traveler?.country) {
      throw new Error('Traveler name, email, and country are required');
    }

    if (!preferences) {
      throw new Error('Preferences are required');
    }

    console.log('Processing lead for all active operators:', {
      travelerInfo: {
        name: traveler.name,
        email: traveler.email,
        country: traveler.country,
        hasPhone: !!traveler.phone,
        hasMessage: !!traveler.message
      }
    });

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

    // Create simplified itinerary
    const mockItinerary = {
      id: crypto.randomUUID(),
      title: `${preferences.duration}-Day Safari Adventure for ${traveler.name}`,
      overview: `A comprehensive ${preferences.duration}-day safari experience tailored for ${preferences.groupSize} travelers from ${traveler.country} with personalized logistics, dietary considerations, and ${preferences.languages ? preferences.languages.join(', ') : 'English'} speaking guide`,
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
      travelerInfo: {
        name: traveler.name,
        country: traveler.country,
        specialRequests: traveler.message || null
      },
      days: Array.from({ length: preferences.duration }, (_, i) => ({
        day: i + 1,
        location: i === 0 ? (travel?.portOfEntry || 'Safari Location') : 'Safari Location',
        accommodation: {
          name: `Safari Lodge ${i + 1}`,
          type: preferences.budgetRange,
          rating: 4.5
        },
        activities: [{
          name: i === 0 ? 'Arrival & Transfer' : 'Game Drive',
          duration: i === 0 ? '2-3 hours' : '3-4 hours',
          description: i === 0 ? `Airport pickup and transfer to lodge for ${traveler.name}` : 'Wildlife viewing experience',
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

    // Create enhanced preferences object with all enquirer data
    const enhancedPreferences = {
      ...preferences,
      schedule: processedSchedule,
      travel,
      dietary,
      languages: preferences.languages || ['English'],
      // Include traveler message in preferences for easy access
      message: traveler.message || null
    };

    console.log('Inserting lead into database...');

    // Insert the lead into Supabase - FIXED: Use 'system_matched' instead of 'all_operators'
    const { data: leadData, error } = await supabaseClient
      .from('leads')
      .insert({
        traveler_name: traveler.name,
        traveler_email: traveler.email,
        traveler_phone: traveler.phone || null,
        traveler_country: traveler.country,
        preferences: enhancedPreferences,
        itinerary: mockItinerary,
        status: 'unclaimed',
        assigned_operator_id: null,
        selection_type: 'system_matched', // FIXED: Use valid constraint value
        todo_checklist: []
      })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    console.log('Lead created successfully:', {
      leadId: leadData.id,
      travelerName: leadData.traveler_name,
      travelerCountry: leadData.traveler_country
    });

    // Get all active operators
    console.log('Fetching all active operators...');
    const { data: operators, error: operatorsError } = await supabaseClient
      .from('operators')
      .select('id, company')
      .eq('is_active', true);

    if (operatorsError) {
      console.error('Error fetching operators:', operatorsError);
      // Don't fail the whole request, just log the error
    } else if (operators && operators.length > 0) {
      console.log(`Found ${operators.length} active operators, posting lead to all`);

      // Create visibility entries for all active operators
      const visibilityEntries = operators.map(operator => ({
        lead_id: leadData.id,
        operator_id: operator.id
      }));

      const { error: visibilityError } = await supabaseClient
        .from('lead_visibility')
        .insert(visibilityEntries);

      if (visibilityError) {
        console.error('Error creating lead visibility entries:', visibilityError);
        // Don't fail the whole request
      } else {
        console.log(`Lead visibility created for all ${operators.length} active operators`);
      }
    } else {
      console.log('No active operators found');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lead_id: leadData.id,
          status: leadData.status,
          selection_type: 'system_matched', // Updated to reflect the fix
          operators_notified: operators ? operators.length : 0,
          traveler_info: {
            name: traveler.name,
            country: traveler.country,
            has_phone: !!traveler.phone,
            has_message: !!traveler.message
          },
          assigned_operator: null
        },
        message: `Lead created successfully for ${traveler.name} from ${traveler.country} and posted to all active operators`
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
