
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
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing or invalid authorization header'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT token and check admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get current operator details from database to check role
    const { data: currentOperator, error: currentOperatorError } = await supabase
      .from('operators')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (currentOperatorError || !currentOperator || currentOperator.role !== 'admin') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Admin access required'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // List all operators
      const { data: operators, error: operatorsError } = await supabase
        .from('operators')
        .select('id, name, email, company, role, specializations, is_active, created_at')
        .order('created_at', { ascending: false })

      if (operatorsError) {
        throw new Error(`Failed to fetch operators: ${operatorsError.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: operators
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (req.method === 'POST') {
      // Create new operator
      const { name, email, company, specializations = [] } = await req.json()

      if (!name || !email || !company) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Name, email, and company are required'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Check if operator with email already exists
      const { data: existingOperator } = await supabase
        .from('operators')
        .select('id')
        .eq('email', email)
        .single()

      if (existingOperator) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Operator with this email already exists'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Create user in Supabase Auth first
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true
      })

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }

      // Insert operator into operators table
      const { data: newOperator, error: insertError } = await supabase
        .from('operators')
        .insert({
          name,
          email,
          company,
          role: 'operator',
          specializations,
          password_hash: 'managed_by_supabase_auth',
          is_active: true
        })
        .select()
        .single()

      if (insertError) {
        // If operator creation fails, clean up the auth user
        await supabase.auth.admin.deleteUser(authUser.user.id)
        throw new Error(`Failed to create operator: ${insertError.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            ...newOperator,
            temporary_password: tempPassword,
            message: 'Operator created successfully. Please share the temporary password with the operator.'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed'
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Admin operators error:', error)
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
