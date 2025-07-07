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
    console.log('Create lead function called with enhanced enquirer data');
    
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

    // Check if user selected specific packages
    const selectedPackages = preferences.selectedPackages || [];
    const selectionType = selectedPackages.length > 0 ? 'user_selected' : 'system_matched';

    console.log('Enhanced lead processing:', {
      selectionType,
      selectedPackages,
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

    // Enhanced mock itinerary with all traveler information
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
      selectionType,
      selectedPackages: selectedPackages,
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

    console.log('Inserting enhanced lead into database...');

    // Insert the lead into Supabase with all enquirer details
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
        selection_type: selectionType,
        todo_checklist: []
      })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    console.log('Enhanced lead created successfully:', {
      leadId: leadData.id,
      travelerName: leadData.traveler_name,
      travelerCountry: leadData.traveler_country,
      selectionType: leadData.selection_type
    });

    let targetOperators: string[] = [];

    if (selectionType === 'user_selected' && selectedPackages.length > 0) {
      // User selected specific packages - get operators for those packages
      console.log('Processing user-selected packages for enhanced targeting...');
      
      const { data: packages, error: packagesError } = await supabaseClient
        .from('operator_packages')
        .select('operator_id, package_name')
        .in('id', selectedPackages);

      if (packagesError) {
        console.error('Error fetching selected packages:', packagesError);
        // Don't fail the whole request, fall back to system matching
      } else if (packages && packages.length > 0) {
        targetOperators = [...new Set(packages.map(p => p.operator_id))];
        console.log('Target operators from selected packages:', {
          operatorCount: targetOperators.length,
          packageNames: packages.map(p => p.package_name)
        });

        // Insert selected packages into lead_selected_packages table
        const packageEntries = selectedPackages.map(packageId => ({
          lead_id: leadData.id,
          package_id: packageId
        }));

        const { error: selectedPackagesError } = await supabaseClient
          .from('lead_selected_packages')
          .insert(packageEntries);

        if (selectedPackagesError) {
          console.error('Error creating selected packages entries:', selectedPackagesError);
          // Don't fail the whole request
        } else {
          console.log(`Created ${packageEntries.length} selected package entries for enhanced tracking`);
        }
      }
    }

    // If no target operators from user selection, fall back to intelligent matching
    if (targetOperators.length === 0) {
      console.log('Falling back to intelligent operator matching with enhanced criteria...');
      
      const { data: operators, error: operatorsError } = await supabaseClient
        .from('operators')
        .select('id, company, services_offered, destinations_covered')
        .eq('is_active', true);

      if (operatorsError) {
        console.error('Error fetching operators:', operatorsError);
      } else if (operators && operators.length > 0) {
        // Enhanced intelligent matching algorithm
        const interests = enhancedPreferences.interests || [];
        const destinations = extractDestinationsFromItinerary(mockItinerary);
        
        console.log('Enhanced matching criteria:', { 
          interests, 
          destinations, 
          travelerCountry: traveler.country,
          budget: preferences.budgetRange 
        });
        
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
          
          return { 
            operator_id: operator.id, 
            company: operator.company,
            score 
          };
        });

        // Sort by score and take top 3-5 operators
        const topOperators = operatorScores
          .filter(op => op.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        console.log('Top matched operators for enhanced lead:', topOperators);

        // If no operators scored, fall back to first few active operators
        targetOperators = topOperators.length > 0 
          ? topOperators.map(op => op.operator_id)
          : operators.slice(0, 3).map(op => op.id);
      }
    }

    // Insert into lead_visibility table for target operators
    if (targetOperators.length > 0) {
      const visibilityEntries = targetOperators.map(operatorId => ({
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
        console.log(`Enhanced lead visibility created for ${targetOperators.length} operators`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lead_id: leadData.id,
          status: leadData.status,
          selection_type: selectionType,
          operators_notified: targetOperators.length,
          traveler_info: {
            name: traveler.name,
            country: traveler.country,
            has_phone: !!traveler.phone,
            has_message: !!traveler.message
          },
          assigned_operator: null
        },
        message: `Enhanced lead created successfully for ${traveler.name} from ${traveler.country} and ${selectionType === 'user_selected' ? 'sent to selected' : 'matched to'} operators`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating enhanced lead:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create enhanced lead'
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
