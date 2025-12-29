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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, message: "Email and password required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: operator } = await supabase.from("operators").select("*").eq("email", email).eq("is_active", true).single();
    if (!operator) {
      return new Response(JSON.stringify({ success: false, message: "Invalid email or password" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      return new Response(JSON.stringify({ success: false, message: "Invalid email or password" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch roles from user_roles table
    const { data: userRoles } = await supabase.from("user_roles").select("role").eq("user_id", operator.id);
    const roles = userRoles?.map(r => r.role) || [operator.role || 'operator'];

    return new Response(JSON.stringify({
      success: true,
      data: {
        access_token: authData.session.access_token,
        token_type: "bearer",
        expires_in: authData.session.expires_in,
        operator: { id: operator.id, name: operator.name, email: operator.email, company: operator.company, role: roles[0], roles, specializations: operator.specializations || [] }
      }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
