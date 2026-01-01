import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default checklist items for new leads
const DEFAULT_CHECKLIST = [
  { "id": "task-1", "task": "Review Lead & Itinerary", "completed": false, "created_at": new Date().toISOString() },
  { "id": "task-2", "task": "Send Initial Contact Email", "completed": false, "created_at": new Date().toISOString() },
  { "id": "task-3", "task": "Prepare Detailed Quote", "completed": false, "created_at": new Date().toISOString() },
  { "id": "task-4", "task": "Send Quote to Traveler", "completed": false, "created_at": new Date().toISOString() },
  { "id": "task-5", "task": "Follow Up with Traveler", "completed": false, "created_at": new Date().toISOString() },
  { "id": "task-6", "task": "Confirm Booking & Payment", "completed": false, "created_at": new Date().toISOString() }
];

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

    console.log('✅ Validation passed - Creating leads for selected operators:', {
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

    console.log('📝 Creating leads with enhanced preferences and default checklist:', {
      preferencesKeys: Object.keys(enhancedPreferences),
      hasItinerary: !!itinerary,
      checklistItems: DEFAULT_CHECKLIST.length
    });

    // Create separate leads for each selected operator
    const createdLeads = [];
    const visibilityEntries = [];

    for (const operatorId of selectedOperatorIds) {
      console.log(`📋 Creating lead for operator: ${operatorId}`);
      
      // Create individual lead assigned directly to this operator with default checklist
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
          assigned_operator_id: operatorId,
          selection_type: 'user_selected',
          todo_checklist: DEFAULT_CHECKLIST // Add default checklist
        })
        .select()
        .single();

      if (leadError) {
        console.error(`❌ Database insertion error for operator ${operatorId}:`, leadError);
        console.error('🔍 Error details:', JSON.stringify(leadError, null, 2));
        throw leadError;
      }

      console.log(`✅ Lead created successfully for operator ${operatorId}:`, {
        leadId: leadData.id,
        travelerName: leadData.traveler_name,
        status: leadData.status,
        assignedOperatorId: leadData.assigned_operator_id,
        selectionType: leadData.selection_type,
        checklistItems: leadData.todo_checklist?.length || 0
      });

      createdLeads.push(leadData);

      // Also create visibility entry for completeness
      visibilityEntries.push({
        lead_id: leadData.id,
        operator_id: operatorId
      });
    }

    // Create visibility entries for all leads
    if (visibilityEntries.length > 0) {
      console.log('📋 Creating lead visibility entries:', visibilityEntries);

      const { data: visibilityData, error: visibilityError } = await supabaseClient
        .from('lead_visibility')
        .insert(visibilityEntries)
        .select();

      if (visibilityError) {
        console.warn('⚠️ Error creating lead visibility entries (non-critical):', visibilityError);
      } else {
        console.log('✅ Lead visibility created successfully:', {
          entriesCreated: visibilityData?.length || 0
        });
      }
    }

    // Create in-app notifications for selected operators
    const notificationEntries = selectedOperatorIds.map((operatorId: string, index: number) => ({
      recipient_id: operatorId,
      type: 'new_lead',
      title: 'New Safari Lead Assigned',
      message: `${traveler.name} from ${traveler.country} selected you for their ${preferences.duration}-day safari`,
      data: { 
        lead_id: createdLeads[index]?.id, 
        traveler_name: traveler.name,
        traveler_country: traveler.country,
        duration: preferences.duration
      },
      read: false
    }));

    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notificationEntries);

    if (notificationError) {
      console.warn('⚠️ Error creating notifications (non-critical):', notificationError);
    } else {
      console.log('✅ Notifications created for all selected operators');
    }

    const response = {
      success: true,
      data: {
        leads_created: createdLeads.length,
        lead_ids: createdLeads.map(lead => lead.id),
        operators_assigned: selectedOperatorIds.length,
        checklist_items_per_lead: DEFAULT_CHECKLIST.length,
        traveler_info: {
          name: traveler.name,
          country: traveler.country
        }
      },
      message: `Successfully created ${createdLeads.length} lead${createdLeads.length > 1 ? 's' : ''} with default checklist and assigned to ${selectedOperatorIds.length} operator${selectedOperatorIds.length > 1 ? 's' : ''}`
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
    console.error('💥 Error creating leads with operators:', error);
    console.error('🔍 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create leads',
        details: error.stack || 'No additional details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
