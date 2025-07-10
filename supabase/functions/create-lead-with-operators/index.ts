
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
    console.log('🚀 Create lead with selected operators function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requestBody = await req.json();
    console.log('📥 Request body received:', JSON.stringify(requestBody, null, 2));

    const { traveler, preferences, schedule, travel, dietary, itinerary, selectedOperatorIds } = requestBody;

    // Enhanced validation with detailed logging
    if (!traveler?.name || !traveler?.email || !traveler?.country) {
      const error = 'Traveler name, email, and country are required';
      console.error('❌ Validation error:', error);
      console.log('🔍 Received traveler data:', traveler);
      throw new Error(error);
    }

    if (!preferences) {
      const error = 'Preferences are required';
      console.error('❌ Validation error:', error);
      throw new Error(error);
    }

    if (!selectedOperatorIds || !Array.isArray(selectedOperatorIds) || selectedOperatorIds.length === 0) {
      const error = 'At least one operator must be selected';
      console.error('❌ Validation error:', error);
      console.log('🔍 Received selectedOperatorIds:', selectedOperatorIds);
      throw new Error(error);
    }

    console.log('✅ Validation passed - Creating lead for selected operators:', {
      travelerInfo: {
        name: traveler.name,
        email: traveler.email,
        country: traveler.country
      },
      selectedOperatorIds: selectedOperatorIds,
      selectedOperatorCount: selectedOperatorIds.length
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

    console.log('📝 Creating lead with enhanced preferences:', {
      preferencesKeys: Object.keys(enhancedPreferences),
      hasItinerary: !!itinerary
    });

    // Create the lead with 'new' status for direct selection flow
    const { data: leadData, error: leadError } = await supabaseClient
      .from('leads')
      .insert({
        traveler_name: traveler.name,
        traveler_email: traveler.email,
        traveler_phone: traveler.phone || null,
        traveler_country: traveler.country,
        preferences: enhancedPreferences,
        itinerary: itinerary,
        status: 'new', // Changed from 'unclaimed' to 'new' for direct selection
        assigned_operator_id: null,
        selection_type: 'user_selected' // Track that this was user-selected
      })
      .select()
      .single();

    if (leadError) {
      console.error('❌ Database insertion error:', leadError);
      console.error('🔍 Error details:', JSON.stringify(leadError, null, 2));
      throw leadError;
    }

    console.log('✅ Lead created successfully:', {
      leadId: leadData.id,
      travelerName: leadData.traveler_name,
      status: leadData.status,
      selectionType: leadData.selection_type
    });

    // Create visibility entries for selected operators
    console.log('📋 Creating lead visibility entries...');
    const visibilityEntries = selectedOperatorIds.map(operatorId => ({
      lead_id: leadData.id,
      operator_id: operatorId
    }));

    console.log('🔍 Visibility entries to create:', visibilityEntries);

    const { data: visibilityData, error: visibilityError } = await supabaseClient
      .from('lead_visibility')
      .insert(visibilityEntries)
      .select();

    if (visibilityError) {
      console.error('❌ Error creating lead visibility entries:', visibilityError);
      console.error('🔍 Visibility error details:', JSON.stringify(visibilityError, null, 2));
      throw visibilityError;
    }

    console.log('✅ Lead visibility created successfully:', {
      entriesCreated: visibilityData?.length || 0,
      selectedOperators: selectedOperatorIds.length,
      visibilityData: visibilityData
    });

    // Verify the entries were created by reading them back
    const { data: verifyVisibility, error: verifyError } = await supabaseClient
      .from('lead_visibility')
      .select('*')
      .eq('lead_id', leadData.id);

    if (verifyError) {
      console.warn('⚠️ Could not verify visibility entries:', verifyError);
    } else {
      console.log('🔍 Verification - Lead visibility entries in DB:', verifyVisibility);
    }

    const response = {
      success: true,
      data: {
        lead_id: leadData.id,
        status: leadData.status,
        selection_type: leadData.selection_type,
        operators_notified: selectedOperatorIds.length,
        visibility_entries_created: visibilityData?.length || 0,
        traveler_info: {
          name: traveler.name,
          country: traveler.country
        }
      },
      message: `Lead created successfully and sent to ${selectedOperatorIds.length} selected operators`
    };

    console.log('🎉 Sending success response:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Error creating lead with operators:', error);
    console.error('🔍 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create lead',
        details: error.stack || 'No additional details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
