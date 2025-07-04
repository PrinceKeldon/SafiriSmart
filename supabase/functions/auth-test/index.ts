
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting auth connectivity test...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      supabaseUrlValue: supabaseUrl // Log the actual URL for debugging
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
          debug: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceKey
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Attempting to list users via Auth API...');
    // Attempt to list users - this requires the service role key and correct URL
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Auth Test Error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Auth Test Failed', 
          error: error.message, 
          errorCode: error.code || 'unknown',
          details: error,
          debug: {
            supabaseUrl: supabaseUrl,
            hasServiceKey: !!supabaseServiceKey
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Auth test successful, users found:', data.users?.length || 0);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Auth Test Succeeded', 
        usersCount: data.users?.length || 0,
        debug: {
          supabaseUrl: supabaseUrl,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('General Test Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error during test', 
        error: error.message,
        errorType: error.constructor.name,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
