
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    // For demo purposes, validate against demo credentials
    if (email === 'demo@safariexperts.com' && password === 'password123') {
      // Create a mock JWT token and operator data
      const mockOperator = {
        id: '1',
        name: 'Safari Experts Demo',
        email: 'demo@safariexperts.com',
        company: 'Safari Experts Ltd',
        specializations: ['Wildlife Safari', 'Cultural Tours', 'Photography Tours']
      }

      const mockToken = btoa(JSON.stringify({
        sub: email,
        exp: Date.now() + (60 * 60 * 1000), // 1 hour
        operator: mockOperator
      }))

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            access_token: `mock_${mockToken}`,
            token_type: 'bearer',
            expires_in: 3600,
            operator: mockOperator
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Invalid credentials
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Incorrect email or password'
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
