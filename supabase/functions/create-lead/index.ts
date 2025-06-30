
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { traveler, preferences } = await req.json();

    // For now, we'll create a simple itinerary structure
    // In a real implementation, this would call an AI service
    const mockItinerary = {
      id: crypto.randomUUID(),
      title: `${preferences.duration}-Day Safari Adventure`,
      overview: `A ${preferences.duration}-day safari experience tailored for ${preferences.groupSize} travelers`,
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
      days: Array.from({ length: preferences.duration }, (_, i) => ({
        day: i + 1,
        location: 'Safari Location',
        accommodation: {
          name: 'Safari Lodge',
          type: preferences.budgetRange,
          rating: 4.5
        },
        activities: [{
          name: 'Game Drive',
          duration: '3-4 hours',
          description: 'Wildlife viewing experience',
          cost: 150,
          type: 'safari'
        }],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        transport: 'Safari Vehicle',
        notes: 'Day activity notes'
      }))
    };

    // Insert the lead into Supabase
    const { data, error } = await supabaseClient
      .from('leads')
      .insert({
        traveler_name: traveler.name,
        traveler_email: traveler.email,
        traveler_phone: traveler.phone || null,
        traveler_country: traveler.country || null,
        preferences: preferences,
        itinerary: mockItinerary,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lead_id: data.id,
          status: data.status,
          assigned_operator: null
        },
        message: 'Lead created successfully'
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
