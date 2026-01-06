// Operator Signup Edge Function - v1.3 (with Demo Mode support)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("operator-signup v1.3 - Request received:", new Date().toISOString());

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' },
    auth: { persistSession: false }
  });

  try {
    // Check if operator onboarding is enabled (Demo Mode check)
    const { data: settingData, error: settingError } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'operator_onboarding_enabled')
      .single();

    // If setting exists and is false, block signups
    if (!settingError && settingData && settingData.value === false) {
      console.log("operator-signup v1.3 - Onboarding is disabled (Demo Mode)");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Operator registration is temporarily closed during our demo period. Please contact support for more information." 
        }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, name, company, specializations = [] } = await req.json();

    if (!email || !password || !name || !company) {
      console.log("operator-signup v1.3 - Validation failed: missing required fields");
      return new Response(JSON.stringify({ success: false, message: "Email, password, name, and company are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check existing user
    const { data: existingOp } = await supabase.from("operators").select("id").eq("email", email).single();
    if (existingOp) {
      console.log("operator-signup v1.3 - User already exists:", email);
      return new Response(JSON.stringify({ success: false, message: "A user with this email already exists" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, company } });
    if (authError) {
      console.log("operator-signup v1.2 - Auth error:", authError.message);
      return new Response(JSON.stringify({ success: false, message: authError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: operator, error: opError } = await supabase.from("operators").insert({
      id: authData.user.id, name, email, company, specializations, password_hash: "managed_by_supabase_auth", role: "operator", is_active: true
    }).select().single();

    if (opError) {
      console.log("operator-signup v1.2 - Operator insert error:", opError.message);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ success: false, message: opError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Insert role into user_roles table (ignore errors if table doesn't exist or role already exists)
    const { error: roleError } = await supabase.from("user_roles").insert({ 
      user_id: authData.user.id, 
      role: "operator" 
    });
    if (roleError) {
      console.log("operator-signup v1.2 - Note: Could not insert user role:", roleError.message);
    }

    console.log("operator-signup v1.2 - Success! Operator created:", operator.email);
    return new Response(JSON.stringify({
      success: true, message: "Operator account created successfully",
      data: { operator: { id: operator.id, name: operator.name, email: operator.email, company: operator.company, role: "operator", specializations: operator.specializations || [] } }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("operator-signup v1.2 - Unexpected error:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
