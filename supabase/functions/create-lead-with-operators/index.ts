
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
    console.log('Create lead with selected operators function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    const { traveler, preferences, schedule, travel, dietary, itinerary, selected_operator_ids } = requestBody;

    // Validation
    if (!traveler?.name || !traveler?.email || !traveler?.country) {
      throw new Error('Traveler name, email, and country are required');
    }

    if (!preferences) {
      throw new Error('Preferences are required');
    }

    if (!selected_operator_ids || !Array.isArray(selected_operator_ids) || selected_operator_ids.length === 0) {
      throw new Error('At least one operator must be selected');
    }

    console.log('Creating lead for selected operators:', {
      travelerInfo: {
        name: traveler.name,
        email: traveler.email,
        country: traveler.country
      },
      selectedOperatorIds: selected_operator_ids
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

    // Enhanced preferences with all data
    const enhancedPreferences = {
      ...preferences,
      schedule: processedSchedule,
      travel,
      dietary,
      languages: preferences.languages || ['English'],
      message: traveler.message || null
    };

    // Create the lead
    const { data: leadData, error: leadError } = await supabaseClient
      .from('leads')
      .insert({
        traveler_name: traveler.name,
        traveler_email: traveler.email,
        traveler_phone: traveler.phone || null,
        traveler_country: traveler.country,
        preferences: enhancedPreferences,
        itinerary: itinerary,
        status: 'new',
        assigned_operator_id: null
      })
      .select()
      .single();

    if (leadError) {
      console.error('Database insertion error:', leadError);
      throw leadError;
    }

    console.log('Lead created successfully:', {
      leadId: leadData.id,
      travelerName: leadData.traveler_name
    });

    // Create visibility entries for selected operators
    const visibilityEntries = selected_operator_ids.map(operatorId => ({
      lead_id: leadData.id,
      operator_id: operatorId
    }));

    const { error: visibilityError } = await supabaseClient
      .from('lead_visibility')
      .insert(visibilityEntries);

    if (visibilityError) {
      console.error('Error creating lead visibility entries:', visibilityError);
      throw visibilityError;
    }

    console.log(`Lead visibility created for ${selected_operator_ids.length} selected operators`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lead_id: leadData.id,
          status: leadData.status,
          operators_notified: selected_operator_ids.length,
          traveler_info: {
            name: traveler.name,
            country: traveler.country
          }
        },
        message: `Lead created successfully and sent to ${selected_operator_ids.length} selected operators`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating lead with operators:', error);
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
