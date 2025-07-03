
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
    console.log('Starting operator signup process...')
    
    const { email, password, name, company, specializations = [] } = await req.json()
    console.log('Received signup request for email:', email)

    if (!email || !password || !name || !company) {
      console.error('Missing required fields:', { email: !!email, password: !!password, name: !!name, company: !!company })
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email, password, name, and company are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Server configuration error'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user already exists in auth
    console.log('Checking if user already exists...')
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)
    
    if (existingUser?.user) {
      console.log('User already exists in auth system')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'A user with this email address has already been registered'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create user in Supabase Auth
    console.log('Creating user in auth system...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        name,
        company
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return new Response(
        JSON.stringify({
          success: false,
          message: authError.message || 'Failed to create user account'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!authData.user) {
      console.error('No user returned from auth creation')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to create user'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('User created in auth, creating operator record...')

    // Create operator record
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .insert({
        id: authData.user.id, // Use the same ID as the auth user
        name,
        email,
        company,
        specializations,
        password_hash: 'managed_by_supabase_auth',
        role: 'operator',
        is_active: true
      })
      .select()
      .single()

    if (operatorError) {
      console.error('Operator creation error:', operatorError)
      // Clean up the auth user if operator creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to create operator profile: ' + operatorError.message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Operator signup completed successfully')
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Operator account created successfully',
        data: {
          operator: {
            id: operator.id,
            name: operator.name,
            email: operator.email,
            company: operator.company,
            role: operator.role,
            specializations: operator.specializations || []
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
