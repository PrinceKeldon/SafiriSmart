
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
    console.log('Get public operators function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        db: { schema: 'public' },
        auth: { persistSession: false }
      }
    );

    // Fetch all active operators
    const { data: operators, error: operatorsError } = await supabaseClient
      .from('operators')
      .select(`
        id,
        company_name,
        company,
        description,
        specializations
      `)
      .eq('is_active', true);

    if (operatorsError) {
      console.error('Error fetching operators:', operatorsError);
      throw operatorsError;
    }

    console.log(`Found ${operators?.length || 0} active operators`);

    // For each operator, fetch their top packages
    const operatorsWithPackages = await Promise.all(
      (operators || []).map(async (operator) => {
        const { data: packages, error: packagesError } = await supabaseClient
          .from('operator_packages')
          .select(`
            id,
            package_name,
            description,
            budget_tier,
            min_duration,
            max_duration,
            estimated_cost_per_person_per_day
          `)
          .eq('operator_id', operator.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (packagesError) {
          console.error(`Error fetching packages for operator ${operator.id}:`, packagesError);
        }

        return {
          id: operator.id,
          company_name: operator.company_name || operator.company,
          description: operator.description || `Professional safari operator specializing in ${(operator.specializations || ['wildlife safaris']).join(', ')}`,
          specializations: operator.specializations || [],
          top_packages: (packages || []).map(pkg => ({
            id: pkg.id,
            package_name: pkg.package_name,
            description: pkg.description || "Custom safari package",
            budget_tier: pkg.budget_tier,
            min_duration: pkg.min_duration,
            max_duration: pkg.max_duration,
            estimated_cost_per_person_per_day: pkg.estimated_cost_per_person_per_day
          }))
        };
      })
    );

    return new Response(
      JSON.stringify(operatorsWithPackages),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in get-public-operators function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to fetch operators'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
